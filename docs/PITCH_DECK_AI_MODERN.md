# Modern AI-Enhanced Pitch Deck Generator

## 🎨 New Features

### Modern and Professional Design
- **Modern color palette**: Using Slate and Indigo colors for a professional look
- **Sophisticated gradients**: Gradient effects with ease-out curves for natural rendering
- **Enhanced typography**: Better spacing, optimized line-height and clear visual hierarchy
- **Modern cards**: Drop shadows, rounded borders and advanced visual effects
- **Decorative elements**: Geometric shapes and icons to enrich the design

### Free AI Enhancements
- **Integrated Groq API**: Using Llama3-8b-8192 (free model)
- **Automatic enhancement**: 
  - More engaging company descriptions
  - Reformulated needs for investors
  - Catchier titles
- **Smart fallback**: Rule-based enhancement if AI is not available

### Modernized PDF Structure

#### Page 1 - Cover
- Modern gradient with decorative effects
- Circular logo with 🚀 icon
- Uppercase title with impactful typography
- "AI Enhanced" badge to mark automatic enhancement
- Elegantly formatted date

#### Page 2 - Company Overview
- Header with decorative colored line
- AI-enhanced description
- Grid cards with thematic colors
- Modernized sector and legal status information

#### Page 3 - Metrics & Traction
- Visual metrics with icons
- Colored cards with side borders
- Structured contact information
- Responsive design for different sizes

#### Page 4 - Founding Team
- Adaptive layout (1 or 2 columns)
- Personalized cards per founder
- Thematic icons and colors
- Complete contact information

#### Page 5 - Details & Needs
- AI-enhanced needs
- Project status with visual indicators
- Organized links and resources
- Visual call-to-action

## 🔧 Configuration

### Environment Variables
```env
# Free Groq API for AI enhancement
GROQ_API_KEY=your_groq_api_key_here
```

### Getting a Groq API Key (Free)
1. Visit [console.groq.com](https://console.groq.com/)
2. Create a free account
3. Generate an API key
4. Add it to your `.env.local` file

## 🎯 Usage

```typescript
import { generatePitchDeck } from '@/utils/pitchDeckGenerator';

// The generator will automatically enhance content with AI
await generatePitchDeck(projectData);
```

## 🎨 Color Palette

- **Primary**: Indigo-600 (#4338ca) - Main color
- **Accent**: Pink-500 (#ec4899) - Accent elements
- **Success**: Green-500 (#22c55e) - Positive metrics
- **Warning**: Amber-400 (#fbbf24) - Alerts and needs
- **Info**: Blue-500 (#3b82f6) - General information
- **Slate**: Modern gray shades for text and backgrounds

## 🚀 Possible Future Enhancements

- [ ] Custom theme support
- [ ] Integrated charts and graphs
- [ ] Export to different formats (PowerPoint, etc.)
- [ ] Sector-specialized pitch deck templates
- [ ] Image and logo integration
- [ ] Dark/light mode
- [ ] Animations and transitions for web version

## 📊 AI-Free Fallback

If the Groq API is not available, the system uses automatic enhancement rules:
- Smart capitalization
- Addition of attractive keywords
- Sentence restructuring
- Professional formatting

The PDF will be generated in all cases with modern design, even without AI enhancement.
