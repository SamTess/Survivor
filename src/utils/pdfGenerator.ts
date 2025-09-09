import jsPDF from 'jspdf'

export interface PDFStats {
  totalUsers?: number
  activeProjects?: number
  NewsArticle?: number
  UpcommingEvents?: number
}

export interface PDFActivity {
  id: string
  type: string
  description: string
  timestamp: string
  user?: string
}

export interface PDFEngagementMetrics {
  likes: number
  comments: number
  shares: number
  views: number
}

export interface TrendData {
  totalUsers: string
  activeProjects: string
  NewsArticle: string
  UpcommingEvents: string
}

export async function generateDashboardPDF(
  stats: PDFStats | null,
  activityData: PDFActivity[] | null,
  engagementMetrics: PDFEngagementMetrics | null,
  trends?: TrendData
): Promise<void> {
  const finalTrends: TrendData = trends || {
    totalUsers: '+12%',
    activeProjects: '+8%',
    NewsArticle: '+15%',
    UpcommingEvents: '+22%'
  }

  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 30

  doc.setFillColor(0, 51, 160)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('Montserrat', 'bold')
  doc.text('SURVIVOR', 20, 25)

  doc.setFontSize(12)
  doc.setFont('Open Sans', 'normal')
  doc.text('Dashboard Analytics Report', 20, 35)

  doc.setTextColor(200, 200, 200)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString('fr-FR')} at ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth - 80, 35)

  yPosition = 60

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('Montserrat', 'bold')
  doc.text('Key Performance Indicators', 20, yPosition)
  yPosition += 20

  const drawKPI = (label: string, value: number, trend: string, description: string, x: number, y: number) => {
    doc.setFillColor(250, 250, 250)
    doc.rect(x, y - 10, 80, 35, 'F')

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(x, y - 10, 80, 35, 'S')

    doc.setFontSize(16)
    doc.setFont('Montserrat', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(value.toString(), x + 5, y)

    doc.setFontSize(8)
    doc.setFont('Open Sans', 'normal')
    doc.setTextColor(67, 67, 67)
    doc.text(label, x + 5, y + 8)

    let trendColor: [number, number, number]
    if (trend.includes('+') && !trend.includes('∞')) {
      trendColor = [0, 128, 0]
    } else if (trend.includes('-')) {
      trendColor = [220, 20, 60]
    } else {
      trendColor = [105, 105, 105]
    }
    doc.setTextColor(trendColor[0], trendColor[1], trendColor[2])
    doc.setFontSize(7)
    doc.text(trend, x + 5, y + 15)

    doc.setTextColor(67, 67, 67)
    doc.setFontSize(6)
    const descLines = doc.splitTextToSize(description, 70)
    descLines.forEach((line: string, index: number) => {
      doc.text(line, x + 5, y + 20 + (index * 4))
    })
  }

  if (stats) {
    const kpis = [
      { label: 'Total Users', value: stats.totalUsers || 0, trend: finalTrends.totalUsers, desc: 'Total registered users' },
      { label: 'Active Projects', value: stats.activeProjects || 0, trend: finalTrends.activeProjects, desc: 'Projects active' },
      { label: 'News Article', value: stats.NewsArticle || 0, trend: finalTrends.NewsArticle, desc: 'News article' },
      { label: 'Upcomming Events', value: stats.UpcommingEvents || 0, trend: finalTrends.UpcommingEvents, desc: 'Total user interactions' }
    ]

    kpis.forEach((kpi, index) => {
      const x = 20 + (index % 2) * 90
      const y = yPosition + Math.floor(index / 2) * 45
      drawKPI(kpi.label, kpi.value, kpi.trend, kpi.desc, x, y)
    })

    yPosition += Math.ceil(kpis.length / 2) * 45 + 20
  }

  if (engagementMetrics && yPosition < pageHeight - 60) {
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('Montserrat', 'bold')
    doc.text('Engagement Metrics', 20, yPosition)
    yPosition += 15

    doc.setFontSize(10)
    doc.setFont('Open Sans', 'normal')
    doc.text(`Likes: ${engagementMetrics.likes}`, 20, yPosition)
    doc.text(`Comments: ${engagementMetrics.comments}`, 80, yPosition)
    doc.text(`Shares: ${engagementMetrics.shares}`, 140, yPosition)
    yPosition += 10
    doc.text(`Views: ${engagementMetrics.views}`, 20, yPosition)
    yPosition += 20
  }

  if (activityData && activityData.length > 0 && yPosition < pageHeight - 60) {
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('Montserrat', 'bold')
    doc.text('Recent Activities', 20, yPosition)
    yPosition += 15

    doc.setFontSize(9)
    doc.setFont('Open Sans', 'normal')

    activityData.slice(0, 8).forEach((activity) => {
      if (yPosition > pageHeight - 40) return

      const activityText = `${activity.type}: ${activity.description}`
      const truncatedText = activityText.length > 80 ? activityText.substring(0, 77) + '...' : activityText

      doc.setTextColor(0, 0, 0)
      doc.text(truncatedText, 20, yPosition)

      doc.setTextColor(105, 105, 105)
      doc.setFontSize(7)
      doc.text(new Date(activity.timestamp).toLocaleDateString('fr-FR'), pageWidth - 40, yPosition)

      yPosition += 8
    })
  }

  const footerY = pageHeight - 20
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(20, footerY, pageWidth - 20, footerY)

  doc.setFontSize(8)
  doc.setTextColor(105, 105, 105)
  doc.setFont('Open Sans', 'italic')
  doc.text('Generated by Survivor Admin Dashboard', 20, footerY + 10)
  doc.text(`Page 1 of 1`, pageWidth - 30, footerY + 10)

  doc.save(`survivor-dashboard-${new Date().toISOString().split('T')[0]}.pdf`)
}
