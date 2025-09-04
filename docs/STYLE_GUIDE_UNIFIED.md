# Complete Style Guide - Jeb Incubator Platform

> Unified style guide to maintain visual consistency across the platform

## 📋 Table of Contents

- [🎨 Color Palette](#color-palette)
- [✏️ Typography](#typography)
- [🧩 UI Components](#ui-components)
- [📏 Spacing and Alignment](#spacing-and-alignment)
- [🌙 Dark Mode](#dark-mode)
- [📱 Responsive Design](#responsive-design)
- [⚡ Quick Reference](#quick-reference)
- [📋 Checklist](#checklist)
- [💡 Practical Examples](#practical-examples)

---

## 🎨 Color Palette

### Primary Colors

Our platform uses an OKLCH-based color system for better consistency:

```css
/* Variables defined in src/app/globals.css */
:root {
  --primary: oklch(0.646 0.222 280.116);     /* Modern violet #8B5CF6 */
  --secondary: oklch(0.556 0 0);             /* Neutral gray */
  --destructive: oklch(0.577 0.245 27.325);  /* Red for errors */
  --background: oklch(1 0 0);                /* Pure white */
  --foreground: oklch(0.205 0 0);            /* Black */
  --card: oklch(0.985 0 0);                  /* Off-white for cards */
  --border: oklch(0.922 0 0);                /* Subtle borders */
  --muted: oklch(0.985 0 0);                 /* Discrete background */
}
```

### Color Usage

| Color | Usage | Tailwind Classes |
|-------|-------|------------------|
| **Primary** | Primary buttons, links, interactive elements | `bg-primary`, `text-primary` |
| **Secondary** | Secondary buttons, supporting text | `bg-secondary`, `text-secondary` |
| **Destructive** | Dangerous actions, errors | `bg-destructive`, `text-destructive` |
| **Muted** | Discrete text, backgrounds | `bg-muted`, `text-muted-foreground` |

---

## ✏️ Typography

### Fonts

- **Geist Sans**: Main font (already configured in layout.tsx)
- **Geist Mono**: Monospace font for code

### Typography Hierarchy

| Element | Tailwind Classes | Usage |
|---------|------------------|-------|
| **H1** | `text-4xl font-bold` | Page titles |
| **H2** | `text-3xl font-semibold` | Main sections |
| **H3** | `text-2xl font-semibold` | Sub-sections |
| **H4** | `text-xl font-medium` | Card titles |
| **Body** | `text-base font-normal` | Main text |
| **Small** | `text-sm font-normal` | Secondary text |
| **Caption** | `text-xs font-normal` | Metadata |

---

## 🧩 UI Components

### Buttons

```tsx
// Available variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Browse</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="link">Learn more</Button>

// Available sizes
<Button size="sm">Small (32px)</Button>
<Button size="default">Normal (36px)</Button>
<Button size="lg">Large (40px)</Button>
<Button size="icon">⚙️ (36x36px)</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      Optional content description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Forms

```tsx
// Standard input field
<input
  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  placeholder="Enter your text..."
/>

// Label
<label className="text-sm font-medium leading-none text-foreground">
  Field name
</label>

// Help text
<p className="text-xs text-muted-foreground">
  Help information for the user
</p>
```

---

## 📏 Spacing and Alignment

### Spacing System

| Class | Value | Usage |
|-------|-------|-------|
| `p-4` | 16px | Standard element padding |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Container padding |
| `mb-4` | 16px | Margin between elements |
| `mb-6` | 24px | Margin between sections |
| `mb-8` | 32px | Margin between important sections |

### Standard Containers

```css
/* Main page */
container mx-auto px-4 py-8 max-w-7xl

/* Section */
max-w-4xl mx-auto px-6

/* Centered content */
max-w-2xl mx-auto
```

### Responsive Grids

```tsx
// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Dashboard layout
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-8">Main content</div>
  <div className="lg:col-span-4">Sidebar</div>
</div>
```

---

## 🌙 Dark Mode

### Automatic Configuration

```css
/* Dark mode in src/app/globals.css */
.dark {
  --background: oklch(0.145 0 0);       /* Deep black */
  --foreground: oklch(0.985 0 0);       /* Off-white */
  --card: oklch(0.145 0 0);             /* Dark cards */
  --border: oklch(0.269 0 0);           /* Dark borders */
}
```

### Activation

```typescript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Check state
const isDark = document.documentElement.classList.contains('dark');
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Size | Usage |
|------------|------|-------|
| `sm:` | 640px+ | Landscape phones |
| `md:` | 768px+ | Tablets |
| `lg:` | 1024px+ | Laptops |
| `xl:` | 1280px+ | Wide screens |
| `2xl:` | 1536px+ | Very large screens |

### Responsive Patterns

```tsx
// Responsive navigation
<nav className="block md:hidden">Mobile Menu</nav>
<nav className="hidden md:block">Desktop Menu</nav>

// Adaptive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Adaptive spacing
<div className="p-4 md:p-6 lg:p-8">
```

---

## ⚡ Quick Reference

### Essential Classes

```css
/* Colors */
bg-primary text-primary-foreground     /* Primary button */
bg-background text-foreground          /* Background */
bg-card text-card-foreground           /* Cards */
border-border                          /* Borders */

/* Typography */
text-4xl font-bold                     /* H1 */
text-3xl font-semibold                 /* H2 */
text-base text-muted-foreground        /* Normal text */

/* Spacing */
p-6 mb-4                               /* Card padding, element margin */
space-y-4                              /* Vertical group spacing */
gap-6                                  /* Grid spacing */
```

### Common Patterns

```tsx
// Hero Section
<section className="py-12 px-4">
  <div className="container mx-auto max-w-4xl text-center">
    <h1 className="text-4xl font-bold mb-4">Title</h1>
    <p className="text-xl text-muted-foreground mb-8">Description</p>
    <Button size="lg">Primary CTA</Button>
  </div>
</section>

// Navigation
<nav className="border-b border-border bg-background">
  <div className="container mx-auto px-4 py-3">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-semibold">Logo</h3>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">Sign In</Button>
        <Button size="sm">Sign Up</Button>
      </div>
    </div>
  </div>
</nav>

// Card with hover
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="text-xl">Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">Content</p>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button>Action</Button>
    <Button variant="outline" size="icon">❤️</Button>
  </CardFooter>
</Card>
```

---

## 📋 Checklist

### ✅ Before Committing

**Colors**
- [ ] I only use color variables (`bg-primary`, `text-foreground`)
- [ ] No hardcoded colors (`bg-blue-500`, inline styles)
- [ ] Works in light AND dark mode
- [ ] Contrast ≥ 4.5:1 for normal text

**Typography**
- [ ] Hierarchy respected (`text-4xl font-bold` for H1, etc.)
- [ ] Secondary texts use `text-muted-foreground`
- [ ] Geist font used (already configured)

**Components**
- [ ] Using existing UI components
- [ ] Buttons with standard variants
- [ ] Cards with Header/Content/Footer structure
- [ ] Forms with standardized classes

**Spacing**
- [ ] Consistent spacing (multiples of 4px)
- [ ] Containers with standard max widths
- [ ] Grids with consistent gaps (`gap-4`, `gap-6`)

**Responsive**
- [ ] Works on mobile (`grid-cols-1`)
- [ ] Adapts to tablets (`md:grid-cols-2`)
- [ ] Adapts to computers (`lg:grid-cols-3`)
- [ ] Responsive navigation tested

### ❌ Absolutely Avoid

```css
/* Hardcoded colors */
bg-blue-500 text-white
style={{backgroundColor: '#8B5CF6'}}

/* Non-standard spacing */
p-3 mb-5 mt-7
gap-3 space-y-5

/* Inconsistent typography */
text-lg font-black
style={{fontSize: '18px'}}

/* Forgotten responsive */
grid-cols-3  /* Without responsive! */
```

### 🔍 Mandatory Tests

1. **Desktop (1280px+)**: Navigation, grids, spacing
2. **Tablet (768px-1024px)**: 2-column adaptation
3. **Mobile (<768px)**: 1 column, mobile navigation
4. **Dark Mode**: Toggle and readability check
5. **Accessibility**: Contrast, visible focus, button sizes

---

## 💡 Practical Examples

### Startup Grid

```tsx
function StartupGrid() {
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">Featured Startups</h2>
          <p className="text-base text-muted-foreground">
            Discover the companies shaping the future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => (
            <Card key={startup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{startup.name}</CardTitle>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {startup.category}
                  </span>
                </div>
                <CardDescription>{startup.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Funding</span>
                  <span className="text-sm font-medium">{startup.funding}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1">View Details</Button>
                <Button variant="outline" size="icon">❤️</Button>
                <Button variant="outline" size="icon">🔖</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Contact Form

```tsx
function ContactForm() {
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contact Us</CardTitle>
            <CardDescription>
              Have questions? Don't hesitate to contact us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter your full name"
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="your.email@example.com"
                type="email"
              />
              <p className="text-xs text-muted-foreground">
                Your email will never be shared
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Describe your request..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button type="submit" className="flex-1">Send</Button>
            <Button variant="outline">Cancel</Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
```

### Responsive Dashboard

```tsx
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-base text-muted-foreground">
                Overview of your activity
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Followed Startups", value: "24", change: "+12%" },
                { label: "Events", value: "8", change: "+3%" },
                { label: "Connections", value: "156", change: "+28%" }
              ].map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {metric.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "New startup: TechFlow AI",
                  "Event: Demo Day 2025",
                  "Message from GreenTech Solutions"
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{activity}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Dark Mode Toggle

```tsx
function ThemeToggle() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      🌙
    </Button>
  );
}
```

---

## 🛠️ Tools and Resources

### Recommended VS Code Extensions
- Tailwind CSS IntelliSense
- PostCSS Language Support
- Accessibility Insights

### Utilities
```tsx
// Class combination function (available in utils)
import { cn } from "@/utils/utils"

// Usage
<div className={cn("base-classes", condition && "conditional-classes")} />
```

### Useful Commands
```bash
npm run build  # Check unused classes
npm run lint   # Detect issues
npm run test   # Verify nothing is broken
```

---

## 📚 References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OKLCH Specification](https://oklch.com/)
- [WCAG Accessibility Guide](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last updated:** September 4, 2025
**Version:** 1.0
**Maintained by:** Jeb Incubator Team
