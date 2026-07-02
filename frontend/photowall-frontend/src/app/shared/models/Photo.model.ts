export interface Photo {
  _id: string;

  event: string;

  uploadedBy: string;

  imageUrl: string;

  publicId: string;

  createdAt: string;

  updatedAt: string;
}
 
/**
 * DTO para subir una foto.
 * Se convertirá a FormData en PhotosService.
 */
export interface UploadPhotoDto {
  eventId: string;
  photo: File;
}
