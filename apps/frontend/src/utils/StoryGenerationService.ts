export interface StorySettings {
  title: string;
  childName: string;
  childAge: number;
  language: string;
  illustrationStyle: string;
  numPages: number;
  bookTheme: string;
  childPreferences: {
    interests?: string[];
    colors?: string[];
  };
  models: any;
}

export interface StoryState {
  isGenerating: boolean;
  progress: number;
  statusMessage: string;
  error?: string;
  coverImage?: string;  // Now a URL instead of base64
  pageImages: string[];  // Now an array of URLs instead of base64
  pagesGenerated: number;
  currentPageText: string;
  totalPages?: number;
  bookId?: string;
  title?: string;
}

export interface StoryPage {
  text: string;
  illustrationBase64: string;
}

class StoryGenerationService {
  private xhr: XMLHttpRequest | null = null;
  private state: StoryState = {
    isGenerating: false,
    progress: 0,
    statusMessage: 'Initializing',
    coverImage: undefined,
    pageImages: [],
    pagesGenerated: 0,
    currentPageText: '',
    totalPages: undefined
  };
  
  // Direct callbacks instead of event emitter
  private updateCallbacks: ((state: StoryState) => void)[] = [];
  private completeCallbacks: ((story: any) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];

  public getState(): StoryState {
    return { ...this.state };
  }

  // Register for updates
  public onUpdate(callback: (state: StoryState) => void): () => void {
    this.updateCallbacks.push(callback);
    console.log(`Added update callback. Now have ${this.updateCallbacks.length} update listeners`);
    
    // Return function to remove the callback
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
      console.log(`Removed update callback. Now have ${this.updateCallbacks.length} update listeners`);
    };
  }

  // Register for completion
  public onComplete(callback: (story: any) => void): () => void {
    this.completeCallbacks.push(callback);
    console.log(`Added complete callback. Now have ${this.completeCallbacks.length} complete listeners`);
    
    // Return function to remove the callback
    return () => {
      this.completeCallbacks = this.completeCallbacks.filter(cb => cb !== callback);
      console.log(`Removed complete callback. Now have ${this.completeCallbacks.length} complete listeners`);
    };
  }

  // Register for errors
  public onError(callback: (error: string) => void): () => void {
    this.errorCallbacks.push(callback);
    
    // Return function to remove the callback
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  public generateStory(settings: StorySettings, idToken: string): void {
    // Don't start if already generating
    if (this.state.isGenerating) {
      console.log('Already generating a story, ignoring request');
      return;
    }

    // Reset state
    this.state = {
      isGenerating: true,
      progress: 0,
      statusMessage: 'Initializing story generation...',
      coverImage: undefined,
      pageImages: [],
      pagesGenerated: 0,
      currentPageText: '',
      totalPages: undefined
    };
    this.notifyUpdateListeners();

    // Cancel any existing request
    if (this.xhr) {
      this.xhr.abort();
    }

    console.log('Starting story generation...');
    console.log('Request settings:', settings);

    // Create new XHR request
    const xhr = new XMLHttpRequest();
    this.xhr = xhr;

    xhr.open('POST', 'http://localhost:8000/api/generatestory');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    
    // Process streamed data as it arrives
    let buffer = '';
    xhr.onprogress = (event) => {
      console.log(`Received progress - loaded ${event.loaded} bytes`);
      
      // Get the response text so far
      const responseText = xhr.responseText;
      
      if (responseText.length > 0) {
        // We need to process only new data since last time
        const newText = responseText.substring(buffer.length);
        console.log(`New text: ${newText.length} bytes`);
        
        // Add to buffer and split by newlines
        buffer = responseText;
        
        // Split the buffer by newlines to get complete lines
        const allLines = buffer.split('\n');
        
        // Process complete lines (all except the last one, which might be incomplete)
        const completeLines = allLines.slice(0, -1);
        
        // Keep the last line in the buffer (it might be incomplete)
        buffer = allLines[allLines.length - 1] || '';
        
        console.log(`Processing ${completeLines.length} complete lines, keeping ${buffer.length} bytes in buffer`);
        
        // Process each complete line
        for (let i = 0; i < completeLines.length; i++) {
          const line = completeLines[i].trim();
          if (!line) continue;
          
          try {
            const data = JSON.parse(line);
            console.log(`Received event:`, data.event, data);
            
            this.handleEvent(data);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            console.error('Raw line data:', line);
          }
        }
      }
    };
    
    xhr.onload = () => {
      console.log(`Request completed with status ${xhr.status}`);
      if (!this.state.isGenerating) return;
      
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('Stream complete');
        // Only update if we didn't already get a 'complete' event
        if (this.state.isGenerating) {
          this.state = {
            ...this.state,
            isGenerating: false,
            progress: 100,
            statusMessage: 'Story generation complete!'
          };
          this.notifyUpdateListeners();
        }
      } else {
        console.error('HTTP error:', xhr.status);
        this.state = {
          ...this.state,
          isGenerating: false,
          error: `HTTP error: ${xhr.status}`,
          statusMessage: `Error: HTTP status ${xhr.status}`
        };
        this.notifyUpdateListeners();
        this.notifyErrorListeners(`HTTP error: ${xhr.status}`);
      }
    };
    
    xhr.onerror = () => {
      console.error('Network error');
      this.state = {
        ...this.state,
        isGenerating: false,
        error: 'Network error',
        statusMessage: 'Error: Network error'
      };
      this.notifyUpdateListeners();
      this.notifyErrorListeners('Network error');
    };
    
    xhr.ontimeout = () => {
      console.error('Request timeout');
      this.state = {
        ...this.state,
        isGenerating: false,
        error: 'Request timeout',
        statusMessage: 'Error: Request timeout'
      };
      this.notifyUpdateListeners();
      this.notifyErrorListeners('Request timeout');
    };

    // Send the request
    xhr.send(JSON.stringify({
      settings: {
        ...settings,
        generate_images: true // Enable image generation
      }
    }));
  }

  private handleEvent(data: any) {
    console.log('Received event:', data);
    
    switch (data.event) {
      case 'book_created':
        this.state = {
          ...this.state,
          bookId: data.book_id,
          title: data.title,
          statusMessage: 'Book created, generating cover...'
        };
        break;
        
      case 'cover_generated':
        this.state = {
          ...this.state,
          coverImage: data.cover_image_url,
          statusMessage: 'Cover generated, creating story...',
          progress: 10
        };
        break;
        
      case 'page_generated':
        // Use the progress from the server if available, otherwise calculate it
        const progress = data.progress || 
          (this.state.totalPages ? Math.round((data.page_number / this.state.totalPages) * 100) : 0);
        
        this.state = {
          ...this.state,
          pageImages: [...this.state.pageImages, data.page.illustrationUrl],
          pagesGenerated: data.page_number,
          currentPageText: data.page.text,
          progress,
          statusMessage: `Generated page ${data.page_number}`
        };
        break;
        
      case 'error':
        this.state = {
          ...this.state,
          error: data.error,
          isGenerating: !data.fatal
        };
        break;
        
      case 'complete':
        this.state = {
          ...this.state,
          progress: 100,
          statusMessage: 'Story generation complete!',
          isGenerating: false
        };
        
        const story = {
          id: data.book_id,
          title: data.title,
          coverImageUrl: this.state.coverImage,
          pages: this.state.pageImages.map((imageUrl, index) => ({
            text: this.state.currentPageText,
            illustrationUrl: imageUrl
          }))
        };
        
        this.notifyCompleteListeners(story);
        break;
        
      default:
        console.log('Unknown event:', data);
    }
    
    this.notifyUpdateListeners();
  }

  private notifyUpdateListeners(): void {
    console.log(`Notifying ${this.updateCallbacks.length} update listeners`);
    const stateSnapshot = { ...this.state };
    for (const callback of this.updateCallbacks) {
      try {
        callback(stateSnapshot);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    }
  }

  private notifyCompleteListeners(story: any): void {
    console.log(`Notifying ${this.completeCallbacks.length} complete listeners`);
    for (const callback of this.completeCallbacks) {
      try {
        callback(story);
      } catch (error) {
        console.error('Error in complete callback:', error);
      }
    }
  }

  private notifyErrorListeners(error: string): void {
    console.log(`Notifying ${this.errorCallbacks.length} error listeners`);
    for (const callback of this.errorCallbacks) {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    }
  }

  public cancel(): void {
    console.log('Cancelling story generation');
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
    
    this.state = {
      ...this.state,
      isGenerating: false,
      statusMessage: 'Story generation cancelled'
    };
    this.notifyUpdateListeners();
  }
}

// Create singleton instance
export const storyGenerationService = new StoryGenerationService(); 