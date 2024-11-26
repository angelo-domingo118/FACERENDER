export const proxyImageUrl = (url: string) => {
  // Replace with your Cloudinary cloud name
  const CLOUDINARY_CLOUD = 'your-cloud-name';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/f_auto,q_auto/${encodeURIComponent(url)}`;
}; 