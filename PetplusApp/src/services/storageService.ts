import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

export async function uploadImage(
  uri: string,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      },
    );
  });
}

export function getPetAvatarPath(petId: string): string {
  return `pets/${petId}/avatar.jpg`;
}
