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

export const generatePitchDeck = (project: ProjectData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const usableWidth = pageWidth - (margin * 2);

  let currentY = margin;

  const addText = (text: string, x: number, y: number, options: {
    fontSize?: number;
    maxWidth?: number;
    bold?: boolean;
  } = {}) => {
    const fontSize = options.fontSize || 12;
    const maxWidth = options.maxWidth || usableWidth;
    const lineHeight = fontSize * 1.2;

    pdf.setFontSize(fontSize);
    if (options.bold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    const lines = pdf.splitTextToSize(text, maxWidth);

    for (let i = 0; i < lines.length; i++) {
      if (y + (i * lineHeight) > pageHeight - margin) {
        pdf.addPage();
        y = margin;
        currentY = margin;
      }
      pdf.text(lines[i], x, y + (i * lineHeight));
    }

    return y + (lines.length * lineHeight) + 5;
  };

  const getTextLinesAndHeight = (text: string, fontSize: number, maxWidth: number) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const height = lines.length * (fontSize * 1.2);
    return { lines, height };
  };

  const ensureSectionFits = (startY: number, sectionHeight: number) => {
    if (startY + sectionHeight > pageHeight - margin) {
      pdf.addPage();
      return margin;
    }
    return startY;
  };

  const drawSectionRect = (y: number, height: number) => {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, y, usableWidth, height);
  };

  const addSection = (title: string, content: string, startY: number) => {
    const contentMaxWidth = usableWidth - 20;
    const titleFontSize = 14;
    const contentFontSize = 10;
    const padding = 10;
    const spaceBetweenTitleAndContent = 5;

    const { height: titleHeight } = getTextLinesAndHeight(title, titleFontSize, contentMaxWidth);
    const { height: contentHeight } = getTextLinesAndHeight(content, contentFontSize, contentMaxWidth);

    const totalContentHeight = padding + titleHeight + spaceBetweenTitleAndContent + contentHeight + padding;
    const sectionHeight = Math.max(totalContentHeight, 35);

    startY = ensureSectionFits(startY, sectionHeight);

    drawSectionRect(startY, sectionHeight);

    const nextY = addText(title, margin + padding, startY + padding, {
      fontSize: titleFontSize,
      bold: true,
      maxWidth: contentMaxWidth
    });

    addText(content, margin + padding, nextY + spaceBetweenTitleAndContent, {
      fontSize: contentFontSize,
      maxWidth: contentMaxWidth
    });

    return startY + sectionHeight + 10;
  };

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  currentY = addText(project.name, margin, currentY, { fontSize: 24, bold: true });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  currentY = addText('Pitch Deck', margin, currentY + 5, { fontSize: 16 });

  currentY += 15;

  const overviewContent = `${project.description}\n\nSector: ${project.sector}\nMaturity: ${project.maturity}\nLegal Status: ${project.legal_status}`;
  currentY = addSection('Company Overview', overviewContent, currentY);

  const metricsContent = `Likes: ${project.likesCount}\nBookmarks: ${project.bookmarksCount}\nFollowers: ${project.followersCount}\n\nFounded: ${project.created_at.getFullYear()}`;
  currentY = addSection('Key Metrics', metricsContent, currentY);

  const contactContent = `Address: ${project.address}\nPhone: ${project.phone}\nEmail: ${project.email}`;
  currentY = addSection('Contact Information', contactContent, currentY);

  pdf.addPage();
  currentY = margin;

  if (project.founders && project.founders.length > 0) {
    const foundersText = project.founders
      .map(founder => `${founder.user.name} (${founder.user.email})`)
      .join('\n');
    currentY = addSection('Founding Team', foundersText, currentY);
  }

  if (project.details && project.details.length > 0) {
    const detail = project.details[0];

    if (detail.project_status) {
      currentY = addSection('Project Status', detail.project_status, currentY);
    }

    if (detail.needs) {
      currentY = addSection('Current Needs', detail.needs, currentY);
    }

    if (detail.website_url || detail.social_media_url) {
      const linksContent = [
        detail.website_url ? `Website: ${detail.website_url}` : '',
        detail.social_media_url ? `Social Media: ${detail.social_media_url}` : ''
      ].filter(Boolean).join('\n');

      if (linksContent) {
        addSection('Links & Resources', linksContent, currentY);
      }
    }
  }

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);

  pdf.save(`${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_pitch_deck.pdf`);
};
