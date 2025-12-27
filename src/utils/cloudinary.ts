export const uploadToCloudinary = async (imageUri: string) => {
    // Hardcoded credentials as requested by user
    const cloudName = 'keepto'; // Assuming cloud name is same as project/preset
    const uploadPreset = 'keepto';

    const data = new FormData();
    // @ts-ignore
    data.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile_photo.jpg',
    });
    data.append('upload_preset', uploadPreset);
    data.append('api_key', '651888216577316');

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: data,
        });

        const result = await response.json();

        if (result.secure_url) {
            return result.secure_url;
        } else {
            console.error('Cloudinary Result Error:', result);
            throw new Error(result.error?.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};
