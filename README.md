# eezyhealth Web

A modern health management dashboard built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Dark & Light Mode** - Seamless theme switching with persistent preferences
- 📱 **Responsive Design** - Optimized for all device sizes
- 🚀 **Modern Tech Stack** - Built with Next.js 15, TypeScript, and Tailwind CSS
- 🏥 **Health Dashboard** - Complete healthcare management interface
- 🎯 **Accessibility** - WCAG compliant with proper ARIA labels

## Theme System

The application features a comprehensive theme system with CSS custom properties:

### Light Mode Colors
- **Primary**: Green (#22c55e) - Main brand color
- **Background**: White (#ffffff)
- **Cards**: White (#ffffff) with subtle borders
- **Text**: Dark (#171717) for optimal readability

### Dark Mode Colors
- **Primary**: Green (#22c55e) - Consistent brand identity
- **Background**: Dark blue (#0f172a)
- **Cards**: Dark slate (#1e293b)
- **Text**: Light (#f8fafc) for contrast

### Theme-Specific Colors
- **Success**: Green for positive actions
- **Warning**: Amber for caution states
- **Info**: Blue for informational content
- **Danger**: Red for destructive actions
- **Status Colors**: Pending, approved, rejected, completed states

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eezyhealth_web
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles and theme variables
│   ├── layout.tsx      # Root layout with theme provider
│   └── page.tsx        # Main dashboard page
├── components/         # Reusable components
│   └── ThemeToggle.tsx # Theme switching component
└── contexts/          # React contexts
    └── ThemeContext.tsx # Theme state management
```

## Theme Usage

### Using Theme Context

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### CSS Custom Properties

The theme system provides CSS custom properties that automatically adapt:

```css
.my-component {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

### Tailwind Integration

Tailwind CSS classes automatically use the theme variables:

```tsx
<div className="bg-background text-foreground border-border">
  Content
</div>
```

## Customization

### Adding New Colors

1. Add color variables to `src/app/globals.css`:
```css
:root {
  --my-color: #your-color;
}

[data-theme="dark"] {
  --my-color: #your-dark-color;
}
```

2. Use in components:
```tsx
<div className="bg-[var(--my-color)]">
  Custom colored content
</div>
```

### Theme Persistence

User theme preferences are automatically saved to localStorage and restored on page reload.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
