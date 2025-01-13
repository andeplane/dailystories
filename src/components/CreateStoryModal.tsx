import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Divider, Button, message } from 'antd';
import type { StorySettings } from '../utils/StoryGenerator';
import { OpenAIService } from '../utils/OpenAIService';
import CreateStoryProgressModal from './CreateStoryProgressModal';
import { MixpanelService } from '../utils/MixpanelService';
const { TextArea } = Input;

interface CreateStoryModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (settings: StorySettings) => void;
  apiKey: string;
}

const STORAGE_KEY = 'book_settings_preferences';

const extractJSON = (text: string): string => {
  // Look for content between code blocks
  const match = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
  if (match) {
    return match[1];
  }
  // If no code blocks, assume the entire text is JSON
  return text;
};

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ open, onCancel, onSubmit, apiKey }) => {
  const [form] = Form.useForm();
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [canSuggest, setCanSuggest] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationSettings, setGenerationSettings] = useState<StorySettings | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Load saved preferences when modal opens
  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      form.setFieldsValue(preferences);
      // Check fields after setting values
      const values = form.getFieldsValue();
      setCanSuggest(Boolean(values.childName && values.childAge && apiKey));
    }
  }, [form, open, apiKey]);

  // Save preferences on field changes
  const handleFieldChange = () => {
    const values = form.getFieldsValue();
    const preferencesToSave = {
      childName: values.childName,
      childAge: values.childAge,
      interests: values.interests,
      colors: values.colors,
      language: values.language,
      illustrationStyle: values.illustrationStyle,
      numPages: values.numPages,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencesToSave));
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Add tracking before submitting
      MixpanelService.trackBookSettingsSubmit(values);

      // Save preferences to localStorage (excluding storylineInstructions)
      const preferencesToSave = {
        childName: values.childName,
        childAge: values.childAge,
        interests: values.interests,
        colors: values.colors,
        language: values.language,
        illustrationStyle: values.illustrationStyle,
        numPages: values.numPages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencesToSave));

      const settings: StorySettings = {
        ...values,
        childPreferences: {
          interests: values.interests?.split(',').map((i: string) => i.trim()),
          colors: values.colors?.split(',').map((c: string) => c.trim()),
        },
        models: {
          outlineModel: 'gpt-4o-mini',
          generationModel: 'gpt-4o-mini',
          feedbackModel: 'gpt-4o-mini',
        },
        openAIApiKey: apiKey
      };

      setGenerationSettings(settings);
      setShowGenerationModal(true);
    });
  };

  const handleSuggest = async () => {
    const childName = form.getFieldValue('childName');
    const childAge = form.getFieldValue('childAge');
    const interests = form.getFieldValue('interests');
    const language = form.getFieldValue('language') || 'English';
    
    // Add tracking
    MixpanelService.trackSuggestionClick(childAge, language);

    if (!childName || !childAge) {
      message.warning('Please enter the child\'s name and age first');
      return;
    }

    if (!apiKey) {
      message.error('API key is missing');
      return;
    }

    setIsSuggestLoading(true);
    try {
      const openai = new OpenAIService(apiKey);
      
      const systemPrompt = `You are a children's book idea generator. Generate a creative story idea for a child. 
                     Respond in JSON format with three fields: 
                     "title" (an engaging title including the child's name),
                     "theme" (a short theme description),
                     "storyline" (one sentence about the story).
                     Make it age-appropriate and incorporate their interests if provided.
                     Respond in the specified language.`;

      const userPrompt = `Generate a story idea for:
                     Name: ${childName}
                     Age: ${childAge}
                     Interests: ${interests || 'not specified'}
                     Language: ${language}`;

      console.log('Sending request to OpenAI with:', { userPrompt, systemPrompt });
      
      const response = await openai.generateCompletion(
        userPrompt,
        'gpt-4o-mini',
        16384,
        systemPrompt
      );
      
      console.log('Received response:', response);

      try {
        const cleanResponse = extractJSON(response);
        const suggestion = JSON.parse(cleanResponse);
        
        form.setFieldsValue({
          title: suggestion.title,
          bookTheme: suggestion.theme,
          storylineInstructions: suggestion.storyline
        });
        
        const allValues = form.getFieldsValue();
        const valid = Boolean(
          allValues.title &&
          allValues.bookTheme &&
          allValues.storylineInstructions &&
          allValues.childName &&
          allValues.childAge &&
          allValues.language &&
          allValues.illustrationStyle &&
          allValues.numPages
        );
        setIsFormValid(valid);
        
        message.success('Story suggestion generated successfully!');
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.error('Raw response:', response);
        message.error('Received invalid response format from AI');
      }
    } catch (error) {
      console.error('Failed to generate suggestion:', error);
      message.error(
        error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Failed to generate story suggestion. Please try again.'
      );
    } finally {
      setIsSuggestLoading(false);
    }
  };

  // Add this effect to monitor required fields
  useEffect(() => {
    const checkFields = () => {
      const values = form.getFieldsValue();
      setCanSuggest(Boolean(values.childName && values.childAge && apiKey));
    };
    checkFields();
  }, [form, apiKey]);

  const handleModalClose = () => {
    // Add tracking
    MixpanelService.trackBookSettingsCancel();
    setShowGenerationModal(false);
    setGenerationSettings(null);
    onCancel();
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    handleFieldChange();
    setCanSuggest(Boolean(allValues.childName && allValues.childAge && apiKey));
    
    // Use allValues parameter instead of getting values again
    const valid = Boolean(
      allValues.title &&
      allValues.bookTheme &&
      allValues.storylineInstructions &&
      allValues.childName &&
      allValues.childAge &&
      allValues.language &&
      allValues.illustrationStyle &&
      allValues.numPages
    );
    
    console.log('Form validity check:', { allValues, valid }); // Add this for debugging
    setIsFormValid(valid);
  };

  // Add this effect to handle the timer
  useEffect(() => {
    if (showGenerationModal && generationSettings) {
      const totalEstimatedSeconds = generationSettings.numPages * 30;
      setEstimatedTime(totalEstimatedSeconds);
      
      const timer = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= totalEstimatedSeconds) {
            clearInterval(timer);
            return totalEstimatedSeconds;
          }
          return prev + 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        setElapsedTime(0);
      };
    }
  }, [showGenerationModal, generationSettings]);

  return (
    <>
      <Modal
        title="Generate New Story"
        open={open && !showGenerationModal}
        onOk={handleOk}
        onCancel={onCancel}
        width="90vw"
        style={{ maxWidth: '600px' }}
        okButtonProps={{ disabled: !isFormValid }}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          <div style={{ marginBottom: '24px', textAlign: 'right' }}>
            <Button 
              onClick={handleSuggest}
              type="default"
              style={{ marginBottom: '16px' }}
              loading={isSuggestLoading}
              disabled={isSuggestLoading || !canSuggest}
              title={!canSuggest ? "Fill in information about your child to suggest story" : ""}
            >
              {isSuggestLoading ? 'Generating Suggestion...' : 'Suggest Story'}
            </Button>
          </div>

          <Divider orientation="left">Story Details</Divider>
          <div>
            <Form.Item
              name="title"
              label="Story Title"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g., Sarah's Magical Adventure" />
            </Form.Item>

            <Form.Item
              name="bookTheme"
              label="Book Theme"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g., Adventure in space" />
            </Form.Item>

            <Form.Item
              name="storylineInstructions"
              label="Quick summary of the story"
              rules={[{ required: true }]}
            >
              <TextArea 
                rows={3}
                placeholder="e.g., A magical adventure where the child learns about friendship" 
              />
            </Form.Item>
          </div>

          <Divider orientation="left">Child's Information</Divider>
          <div>
            <Form.Item
              name="childName"
              label="Child's Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="childAge"
              label="Child's Age"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={12} />
            </Form.Item>

            <Form.Item
              name="interests"
              label="Interests (comma-separated)"
            >
              <Input placeholder="e.g., dinosaurs, space, princesses" />
            </Form.Item>

            <Form.Item
              name="colors"
              label="Favorite Colors (comma-separated)"
            >
              <Input placeholder="e.g., blue, red, green" />
            </Form.Item>
          </div>

          <Divider orientation="left">Book Settings</Divider>
          <div>
            <Form.Item
              name="language"
              label="Language"
              rules={[{ required: true }]}
              initialValue="English"
            >
              <Select>
                <Select.Option value="English">English</Select.Option>
                <Select.Option value="Norwegian">Norwegian</Select.Option>
                <Select.Option value="Spanish">Spanish</Select.Option>
                <Select.Option value="French">French</Select.Option>
                <Select.Option value="German">German</Select.Option>
                <Select.Option value="Italian">Italian</Select.Option>
                <Select.Option value="Portuguese">Portuguese</Select.Option>
                <Select.Option value="Dutch">Dutch</Select.Option>
                <Select.Option value="Swedish">Swedish</Select.Option>
                <Select.Option value="Danish">Danish</Select.Option>
                <Select.Option value="Finnish">Finnish</Select.Option>
                <Select.Option value="Japanese">Japanese</Select.Option>
                <Select.Option value="Chinese">Chinese</Select.Option>
                <Select.Option value="Korean">Korean</Select.Option>
                <Select.Option value="Russian">Russian</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="illustrationStyle"
              label="Illustration Style"
              rules={[{ required: true }]}
              initialValue="Fantasy"
            >
              <Select>
                <Select.Option value="Fantasy">Fantasy</Select.Option>
                <Select.Option value="Cartoon">Cartoon</Select.Option>
                <Select.Option value="Pencil drawing">Pencil drawing</Select.Option>
                <Select.Option value="Anime">Anime</Select.Option>
                <Select.Option value="Watercolor">Watercolor</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="numPages"
              label="Number of Pages"
              rules={[{ required: true, message: 'Please select between 3-10 pages' }]}
              initialValue={5}
            >
              <InputNumber min={3} max={10} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
      
      {showGenerationModal && generationSettings && (
        <CreateStoryProgressModal
          open={showGenerationModal}
          onCancel={handleModalClose}
          settings={generationSettings}
          estimatedTime={estimatedTime}
          elapsedTime={elapsedTime}
        />
      )}
    </>
  );
};

export default CreateStoryModal; 