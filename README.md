# Alex Rodriguez Portfolio

A modern, responsive portfolio website for Alex Rodriguez, Network & System Engineer Apprentice.

## Features

- **Responsive Design**: Optimized for all devices and screen sizes
- **Modern UI**: Clean, professional design with smooth animations
- **Contact Form**: Functional email system using Supabase Edge Functions
- **SEO Optimized**: Comprehensive meta tags and structured data
- **Performance**: Static export for fast loading times

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Email**: Supabase Edge Functions + Resend API
- **Deployment**: Static export ready

## Email Setup

To enable the contact form email functionality:

1. **Set up Supabase**:
   - Create a Supabase project
   - Note your project URL and anon key

2. **Set up Resend**:
   - Create a Resend account at [resend.com](https://resend.com)
   - Get your API key from the dashboard
   - Verify your domain (optional but recommended)

3. **Configure Environment Variables**:
   Add these to your Supabase Edge Function environment:
   ```
   RESEND_API_KEY=your_resend_api_key
   TO_EMAIL=alex.rodriguez@email.com
   ```

4. **Deploy the Edge Function**:
   The `send-email` function is already created in `/supabase/functions/send-email/`

5. **Update Frontend Environment**:
   Add to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for static export and can be deployed to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Contact Form Features

- **Real-time Validation**: Client-side form validation
- **Email Delivery**: Professional HTML emails via Resend
- **Confirmation Emails**: Automatic confirmation sent to users
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Works perfectly on all devices

## Email Template Features

- **Professional Design**: Clean, branded email templates
- **HTML + Text**: Both HTML and plain text versions
- **Reply-to Setup**: Direct replies go to the sender
- **Confirmation System**: Users receive immediate confirmation

## License

This project is for portfolio purposes. Feel free to use as inspiration for your own portfolio.# portfolio
