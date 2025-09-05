import jsPDF from 'jspdf';

interface ProjectData {
  id: number;
  name: string;
  sector: string;
  maturity: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  legal_status: string;
  created_at: Date;
  likesCount: number;
  bookmarksCount: number;
  followersCount: number;
  details: Array<{
    description?: string;
    website_url?: string;
    social_media_url?: string;
    project_status?: string;
    needs?: string;
  }>;
  founders: Array<{
    user: {
      name: string;
      email: string;
      phone?: string;
    };
  }>;
}

const enhanceContentWithAI = async (content: string, type: string): Promise<string> => {
  try {
    const response = await fetch('/api/ai/enhance-pitch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        type,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to enhance content with AI');
    }

    const data = await response.json();
    console.log('AI enhancement response data:', data);
    return data.enhancedContent || content;
  } catch (error) {
    console.warn('AI enhancement failed, using original content:', error);
    return content;
  }
};

const colors = {
  primary: { r: 79, g: 70, b: 229 }, // indigo-600
  primaryLight: { r: 129, g: 140, b: 248 }, // indigo-400
  accent: { r: 147, g: 51, b: 234 }, // purple-600
  success: { r: 34, g: 197, b: 94 }, // emerald-500
  warning: { r: 245, g: 158, b: 11 }, // amber-500
  info: { r: 59, g: 130, b: 246 }, // blue-500
  gray: { r: 107, g: 114, b: 128 }, // gray-500
  lightGray: { r: 229, g: 231, b: 235 }, // gray-200
  darkGray: { r: 55, g: 65, b: 81 }, // gray-700
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
  background: { r: 248, g: 250, b: 252 } // slate-50
};

export const generatePitchDeck = async (project: ProjectData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const usableWidth = pageWidth - (margin * 2);

  const setColor = (color: { r: number; g: number; b: number }) => {
    pdf.setTextColor(color.r, color.g, color.b);
    return color;
  };

  const setFillColor = (color: { r: number; g: number; b: number }) => {
    pdf.setFillColor(color.r, color.g, color.b);
    return color;
  };

  const setDrawColor = (color: { r: number; g: number; b: number }) => {
    pdf.setDrawColor(color.r, color.g, color.b);
    return color;
  };

  const parseMarkdown = (text: string): Array<{content: string, bold: boolean, italic: boolean}> => {
    const parts: Array<{content: string, bold: boolean, italic: boolean}> = [];
    
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|([^*]+)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match[2]) {
        parts.push({ content: match[2], bold: true, italic: false });
      } else if (match[4]) {
        parts.push({ content: match[4], bold: false, italic: true });
      } else if (match[5]) {
        parts.push({ content: match[5], bold: false, italic: false });
      }
    }
    
    return parts.length > 0 ? parts : [{ content: text, bold: false, italic: false }];
  };

  const calculateOptimalFontSize = (text: string, maxWidth: number, maxHeight: number, baseFontSize: number = 12): number => {
    pdf.setFontSize(baseFontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const estimatedHeight = lines.length * baseFontSize * 0.4;
    
    if (estimatedHeight <= maxHeight) {
      return baseFontSize;
    }
    
    const scaleFactor = maxHeight / estimatedHeight;
    const newFontSize = Math.max(8, Math.floor(baseFontSize * scaleFactor));
    
    return newFontSize;
  };

  const addTextWithMarkdown = (text: string, x: number, y: number, options: {
    fontSize?: number;
    color?: { r: number; g: number; b: number };
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
    maxHeight?: number;
    autoScale?: boolean;
  } = {}) => {
    const baseFontSize = options.fontSize || 12;
    const color = options.color || colors.black;
    const maxWidth = options.maxWidth || usableWidth;
    const maxHeight = options.maxHeight || pageHeight;
    const autoScale = options.autoScale !== false;
    
    const fontSize = autoScale ? calculateOptimalFontSize(text, maxWidth, maxHeight, baseFontSize) : baseFontSize;
    
    const parts = parseMarkdown(text);
    let currentY = y;
    let currentX = x;
    
    // Calculate total width for center/right alignment
    if (options.align === 'center' || options.align === 'right') {
      pdf.setFontSize(fontSize);
      const totalWidth = parts.reduce((width, part) => {
        pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
        return width + pdf.getTextWidth(part.content);
      }, 0);
      
      if (options.align === 'center') {
        currentX = x + (maxWidth - totalWidth) / 2;
      } else if (options.align === 'right') {
        currentX = x + maxWidth - totalWidth;
      }
    }
    
    parts.forEach(part => {
      if (part.content.trim()) {
        pdf.setFontSize(fontSize);
        setColor(color);
        
        let fontStyle = 'normal';
        if (part.bold && part.italic) {
          fontStyle = 'bolditalic';
        } else if (part.bold) {
          fontStyle = 'bold';
        } else if (part.italic) {
          fontStyle = 'italic';
        }
        
        pdf.setFont('helvetica', fontStyle);
        
        // Split long text to multiple lines
        const lines = pdf.splitTextToSize(part.content, maxWidth - (currentX - x));
        lines.forEach((line: string, index: number) => {
          if (currentY + (fontSize * 0.4) > pageHeight - margin) {
            // If we exceed page height, we might need to add a new page or truncate
            return;
          }
          
          pdf.text(line, currentX, currentY + (index * fontSize * 0.4));
          
          if (index === lines.length - 1) {
            // Move X position for next part (only after last line of current part)
            currentX += pdf.getTextWidth(line);
          }
        });
        
        if (lines.length > 1) {
          // If text wrapped to multiple lines, reset X and move Y
          currentY += (lines.length - 1) * fontSize * 0.4;
          currentX = x;
        }
      }
    });
    
    return currentY + fontSize * 0.4 + 5;
  };

  // Function to add elegant text (keeping backward compatibility)
  const addText = (text: string, x: number, y: number, options: {
    fontSize?: number;
    bold?: boolean;
    color?: { r: number; g: number; b: number };
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
    maxHeight?: number;
    autoScale?: boolean;
  } = {}) => {
    // If markdown characters are detected, use the enhanced function
    if (text.includes('**') || text.includes('*')) {
      return addTextWithMarkdown(text, x, y, options);
    }
    
    const baseFontSize = options.fontSize || 12;
    const color = options.color || colors.black;
    const maxWidth = options.maxWidth || usableWidth;
    const maxHeight = options.maxHeight || pageHeight;
    const autoScale = options.autoScale !== false;
    
    // Calculate optimal font size if auto-scaling is enabled
    const fontSize = autoScale ? calculateOptimalFontSize(text, maxWidth, maxHeight, baseFontSize) : baseFontSize;

    pdf.setFontSize(fontSize);
    setColor(color);
    pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');

    if (options.align === 'center') {
      const textWidth = pdf.getTextWidth(text);
      x = x + (maxWidth - textWidth) / 2;
    } else if (options.align === 'right') {
      const textWidth = pdf.getTextWidth(text);
      x = x + maxWidth - textWidth;
    }

    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      pdf.text(line, x, y + (index * fontSize * 0.4));
    });

    return y + (lines.length * fontSize * 0.4) + 5;
  };

  // Function to create elegant rectangles
  const addCard = (x: number, y: number, width: number, height: number, fillColor: { r: number; g: number; b: number }) => {
    setFillColor(fillColor);
    pdf.rect(x, y, width, height, 'F');
    
    setDrawColor(colors.lightGray);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height, 'S');
  };

  // Enhanced function to add card with auto-sizing based on content
  const addCardWithContent = (
    x: number, 
    y: number, 
    width: number, 
    minHeight: number, 
    fillColor: { r: number; g: number; b: number }, 
    title: string, 
    content: string, 
    titleOptions: {
      fontSize?: number;
      bold?: boolean;
      color?: { r: number; g: number; b: number };
    } = {}, 
    contentOptions: {
      fontSize?: number;
      color?: { r: number; g: number; b: number };
      maxWidth?: number;
      maxHeight?: number;
      autoScale?: boolean;
    } = {}
  ) => {
    // Calculate content height
    const titleHeight = 15;
    const padding = 10;
    
    // Measure content height
    pdf.setFontSize(contentOptions.fontSize || 10);
    const contentLines = pdf.splitTextToSize(content, width - padding);
    const contentHeight = contentLines.length * (contentOptions.fontSize || 10) * 0.4 + 5;
    
    // Calculate total required height
    const requiredHeight = Math.max(minHeight, titleHeight + contentHeight + padding);
    
    // Draw the card
    addCard(x, y, width, requiredHeight, fillColor);
    
    // Add title
    addText(title, x + 5, y + 8, {
      fontSize: 12,
      bold: true,
      ...titleOptions
    });
    
    // Add content with markdown support
    addText(content, x + 5, y + 18, {
      fontSize: 10,
      maxWidth: width - 10,
      maxHeight: requiredHeight - titleHeight - 5,
      autoScale: true,
      ...contentOptions
    });
    
    return y + requiredHeight + 10; // Return next Y position
  };

  // Function to add a section with title
  const addSection = (title: string, y: number, titleColor: { r: number; g: number; b: number }) => {
    // Title line
    setFillColor(titleColor);
    pdf.rect(margin, y, usableWidth, 8, 'F');
    
    addText(title, margin + 5, y + 6, {
      fontSize: 14,
      bold: true,
      color: colors.white
    });

    return y + 15;
  };

  // === PAGE 1: COVER ===
  
  // Cover background
  setFillColor(colors.primary);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Main title
  let currentY = 80;
  currentY = addText(project.name.toUpperCase(), margin, currentY, {
    fontSize: 28,
    bold: true,
    color: colors.white,
    align: 'center',
    maxWidth: usableWidth
  });

  // Subtitle
  currentY = addText('PITCH DECK', margin, currentY + 10, {
    fontSize: 16,
    color: colors.primaryLight,
    align: 'center',
    maxWidth: usableWidth
  });

  // Sector and maturity
  currentY = addText(`${project.sector} • ${project.maturity}`, margin, currentY + 15, {
    fontSize: 12,
    color: colors.white,
    align: 'center',
    maxWidth: usableWidth
  });

  // Date
  addText(`Generated on ${new Date().toLocaleDateString('en-US')}`, margin, pageHeight - 30, {
    fontSize: 10,
    color: colors.primaryLight,
    align: 'center',
    maxWidth: usableWidth
  });

  // === PAGE 2: COMPANY OVERVIEW ===
  
  pdf.addPage();
  currentY = margin;

  currentY = addSection('COMPANY OVERVIEW', currentY, colors.primary);

  // Enhance description with AI
  let enhancedDescription = project.description;
  try {
    enhancedDescription = await enhanceContentWithAI(project.description, 'description');
  } catch (error) {
    console.warn('Failed to enhance description:', error);
  }

  // Description card with auto-sizing
  currentY = addCardWithContent(
    margin, 
    currentY, 
    usableWidth, 
    50, 
    colors.background, 
    'OUR VISION', 
    enhancedDescription,
    { color: colors.primary },
    { color: colors.darkGray }
  );

  // Information in columns - reduce spacing
  const colWidth = (usableWidth - 10) / 2;

  // Sector
  addCard(margin, currentY, colWidth, 30, colors.background);
  addText('SECTOR', margin + 5, currentY + 6, {
    fontSize: 10,
    bold: true,
    color: colors.info
  });
  addText(project.sector, margin + 5, currentY + 16, {
    fontSize: 11,
    color: colors.darkGray
  });
  addText(`Maturity: ${project.maturity}`, margin + 5, currentY + 26, {
    fontSize: 8,
    color: colors.gray
  });

  // Legal status
  addCard(margin + colWidth + 10, currentY, colWidth, 30, colors.background);
  addText('LEGAL STATUS', margin + colWidth + 15, currentY + 6, {
    fontSize: 10,
    bold: true,
    color: colors.success
  });
  addText(project.legal_status, margin + colWidth + 15, currentY + 16, {
    fontSize: 11,
    color: colors.darkGray
  });
  addText(`Created: ${new Date(project.created_at).toLocaleDateString('en-US')}`, margin + colWidth + 15, currentY + 26, {
    fontSize: 8,
    color: colors.gray
  });

  currentY += 40; // Reduced spacing

  // === METRICS SECTION (same page) ===
  
  currentY = addSection('METRICS & TRACTION', currentY, colors.accent);

  // Metrics in columns - more compact
  const metricWidth = (usableWidth - 20) / 3;

  // Likes
  addCard(margin, currentY, metricWidth, 25, colors.success);
  addText(project.likesCount.toString(), margin + 5, currentY + 10, {
    fontSize: 16,
    bold: true,
    color: colors.white
  });
  addText('Likes', margin + 5, currentY + 22, {
    fontSize: 7,
    color: colors.white
  });

  // Bookmarks
  addCard(margin + metricWidth + 10, currentY, metricWidth, 25, colors.warning);
  addText(project.bookmarksCount.toString(), margin + metricWidth + 15, currentY + 10, {
    fontSize: 16,
    bold: true,
    color: colors.white
  });
  addText('Bookmarks', margin + metricWidth + 15, currentY + 22, {
    fontSize: 7,
    color: colors.white
  });

  // Followers
  addCard(margin + 2 * (metricWidth + 10), currentY, metricWidth, 25, colors.info);
  addText(project.followersCount.toString(), margin + 2 * (metricWidth + 10) + 5, currentY + 10, {
    fontSize: 16,
    bold: true,
    color: colors.white
  });
  addText('Followers', margin + 2 * (metricWidth + 10) + 5, currentY + 22, {
    fontSize: 7,
    color: colors.white
  });

  currentY += 35; // Reduced spacing

  // === CONTACT SECTION (same page) ===
  
  currentY = addSection('CONTACT INFORMATION', currentY, colors.info);

  // Contact card - more compact
  addCard(margin, currentY, usableWidth, 30, colors.background);
  addText('COMPANY CONTACT', margin + 5, currentY + 6, {
    fontSize: 11,
    bold: true,
    color: colors.primary
  });
  addText(`Address: ${project.address}`, margin + 5, currentY + 16, {
    fontSize: 9,
    color: colors.darkGray
  });
  addText(`Phone: ${project.phone} | Email: ${project.email}`, margin + 5, currentY + 24, {
    fontSize: 9,
    color: colors.darkGray
  });

  currentY += 40;

  // === TEAM SECTION (same page or new page if needed) ===
  
  // Check if we need a new page
  if (currentY > pageHeight - 80) {
    pdf.addPage();
    currentY = margin;
  }

  if (project.founders && project.founders.length > 0) {
    currentY = addSection('FOUNDING TEAM', currentY, colors.info);

    project.founders.forEach((founder, index) => {
      // Check if we need space for another founder
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = margin;
      }
      
      addCard(margin, currentY, usableWidth, 22, colors.background);
      addText(`FOUNDER ${index + 1}`, margin + 5, currentY + 6, {
        fontSize: 10,
        bold: true,
        color: colors.info
      });
      addText(`${founder.user.name} | ${founder.user.email}`, margin + 5, currentY + 16, {
        fontSize: 9,
        color: colors.darkGray
      });
      if (founder.user.phone) {
        addText(`Phone: ${founder.user.phone}`, margin + 5, currentY + 24, {
          fontSize: 8,
          color: colors.gray
        });
      }
      currentY += 28; // Reduced spacing
    });
  }

  // === PROJECT DETAILS SECTION ===
  
  if (project.details && project.details.length > 0) {
    const detail = project.details[0];

    // Check if we need a new page
    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = margin;
    }

    if (detail.needs) {
      let enhancedNeeds = detail.needs;
      try {
        enhancedNeeds = await enhanceContentWithAI(detail.needs, 'needs');
      } catch (error) {
        console.warn('Failed to enhance needs:', error);
      }

      // Enhanced needs with auto-sizing card
      currentY = addCardWithContent(
        margin, 
        currentY, 
        usableWidth, 
        40, 
        colors.background, 
        'OUR NEEDS', 
        enhancedNeeds,
        { color: colors.accent },
        { color: colors.darkGray }
      );
    }

    if (detail.website_url || detail.social_media_url) {
      addCard(margin, currentY, usableWidth, 20, colors.background);
      addText('LINKS', margin + 5, currentY + 6, {
        fontSize: 10,
        bold: true,
        color: colors.success
      });
      let links = '';
      if (detail.website_url) links += `Website: ${detail.website_url}`;
      if (detail.social_media_url) {
        if (links) links += ' | ';
        links += `Social: ${detail.social_media_url}`;
      }
      addText(links, margin + 5, currentY + 16, {
        fontSize: 8,
        color: colors.darkGray
      });
      currentY += 25;
    }
  }

  // Footer with markdown support demo
  addText(`Generated with **AI** on ${new Date().toLocaleString('en-US')} | *Enhanced with automatic scaling*`, margin, pageHeight - 15, {
    fontSize: 8,
    color: colors.gray,
    align: 'center',
    maxWidth: usableWidth,
    autoScale: true
  });

  // Save
  const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_pitch_deck_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};// Utility function to test markdown and auto-scaling features
export const testMarkdownFeatures = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  
  // Example with markdown text
  const markdownText = `**Welcome to our innovative startup!** We are developing *cutting-edge solutions* for the **modern business world**. Our platform provides *seamless integration* with existing systems and **revolutionary features** that transform how companies operate.`;
  
  // Test with auto-scaling
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Markdown & Auto-Scaling Demo', margin, 30);
  
  // Add some demo content
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Original text with markdown:', margin, 50);
  pdf.text(markdownText, margin, 60);
  
  pdf.text('Enhanced text with auto-scaling and markdown parsing:', margin, 100);
  
  // This would need the enhanced functions from the main generator
  pdf.text('(See actual PDF generation for enhanced features)', margin, 120);
  
  pdf.save('markdown_test.pdf');
};
