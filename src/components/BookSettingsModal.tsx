import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Divider, Button, message } from 'antd';
import type { BookSettings } from '../utils/BookGenerator';
import { OpenAIService } from '../utils/OpenAIService';
const { TextArea } = Input;

interface BookSettingsModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (settings: BookSettings) => void;
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

const BookSettingsModal: React.FC<BookSettingsModalProps> = ({ open, onCancel, onSubmit, apiKey }) => {
  const [form] = Form.useForm();
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [canSuggest, setCanSuggest] = useState(false);

  // Load saved preferences when modal opens
  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      form.setFieldsValue(preferences);
    }
  }, [form, open]);

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
      // Save preferences to localStorage (excluding API key)
      const preferencesToSave = {
        childName: values.childName,
        childAge: values.childAge,
        interests: values.interests,
        colors: values.colors,
        language: values.language,
        illustrationStyle: values.illustrationStyle,
        numPages: values.numPages,
        storylineInstructions: values.storylineInstructions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencesToSave));

      onSubmit({
        ...values,
        childPreferences: {
          interests: values.interests?.split(',').map((i: string) => i.trim()),
          colors: values.colors?.split(',').map((c: string) => c.trim()),
        },
        models: {
          outlineModel: 'gpt-4o-mini',
          generationModel: 'gpt-4o-mini',
          feedbackModel: 'gpt-4o-mini',
        }
      });
    });
  };

  const handleSuggest = async () => {
    const childName = form.getFieldValue('childName');
    const childAge = form.getFieldValue('childAge');
    const interests = form.getFieldValue('interests');
    const language = form.getFieldValue('language') || 'English';
    
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
        console.log('Cleaned response:', cleanResponse);
        const suggestion = JSON.parse(cleanResponse);
        console.log('Parsed suggestion:', suggestion);
        
        form.setFieldsValue({
          title: suggestion.title,
          bookTheme: suggestion.theme,
          storylineInstructions: suggestion.storyline
        });
        
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

  return (
    <Modal
      title="Generate New Story"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => {
          handleFieldChange();
          const values = form.getFieldsValue();
          setCanSuggest(Boolean(values.childName && values.childAge && apiKey));
        }}
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
            <Input />
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
              <Select.Option value="Disney">Disney</Select.Option>
              <Select.Option value="Cartoon">Cartoon</Select.Option>
              <Select.Option value="Drawing">Drawing</Select.Option>
              <Select.Option value="Pixar">Pixar</Select.Option>
              <Select.Option value="Anime">Anime</Select.Option>
              <Select.Option value="Watercolor">Watercolor</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="numPages"
            label="Number of Pages"
            rules={[{ required: true }]}
            initialValue={5}
          >
            <InputNumber min={3} max={10} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default BookSettingsModal; 