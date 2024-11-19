export const cloudinaryConfig = {
  cloudName: 'your_cloud_name',
  apiKey: 'your_api_key',
  uploadPreset: 'your_upload_preset'
}

export const getTransformedUrl = (url: string, options: {
  width?: number
  height?: number
  crop?: string
  gravity?: string
  format?: string
  quality?: string
}) => {
  const baseUrl = url.split('/upload/')[1]
  const cloudName = url.split('/')[3]
  
  const transforms = [
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    options.crop && `c_${options.crop}`,
    options.gravity && `g_${options.gravity}`,
    options.format && `f_${options.format}`,
    options.quality && `q_${options.quality}`
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${baseUrl}`
} 