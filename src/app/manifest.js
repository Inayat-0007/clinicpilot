export default function manifest() {
  return {
    name: 'ClinicPilot Pro',
    short_name: 'ClinicPilot',
    description: 'Smart clinic management and automated WhatsApp reminders.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
