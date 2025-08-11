// ai/title-generator.js - AutoList Canada Extension
// AI-powered title generation

export class TitleGenerator {
  constructor() {
    this.tones = {
      'trust-first': 'Professional & Reliable',
      'friendly': 'Friendly & Approachable',
      'enthusiastic': 'Enthusiastic & Energetic',
      'minimalist': 'Minimalist & Direct'
    };
  }
  
  // Generate a title for a listing
  async generateTitle(listingData, tone = 'trust-first') {
    try {
      // Call real AI API for title generation
      const response = await fetch('https://api.autolistcanada.ca/v1/ai/title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY_HERE'
        },
        body: JSON.stringify({
          listingData: listingData,
          tone: tone
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.title;
    } catch (error) {
      console.error('Error generating title with AI:', error);
      // Fallback to mock implementation
      return this.generateTitleMock(listingData, tone);
    }
  }
  
  // Mock implementation as fallback
  generateTitleMock(listingData, tone = 'trust-first') {
    const { title, category, brand, condition } = listingData;
    
    // Base title
    let generatedTitle = title || 'Untitled Listing';
    
    // Apply tone-based modifications
    switch (tone) {
      case 'trust-first':
        if (brand) generatedTitle = `${brand} ${generatedTitle}`;
        if (condition) generatedTitle = `${condition} ${generatedTitle}`;
        break;
      
      case 'friendly':
        generatedTitle = `Lovely ${generatedTitle}`;
        break;
      
      case 'enthusiastic':
        generatedTitle = `Amazing ${generatedTitle} - Don't Miss Out!`;
        break;
      
      case 'minimalist':
        // Keep it simple
        break;
    }
    
    // Ensure title is within character limits
    if (generatedTitle.length > 80) {
      generatedTitle = generatedTitle.substring(0, 77) + '...';
    }
    
    return generatedTitle;
  }
  
  // Generate multiple title options
  async generateTitleOptions(listingData, count = 3) {
    const options = [];
    
    for (const tone in this.tones) {
      if (options.length >= count) break;
      
      const title = await this.generateTitle(listingData, tone);
      options.push({
        title: title,
        tone: tone,
        description: this.tones[tone]
      });
    }
    
    return options;
  }
}
