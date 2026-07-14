import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Photo } from '../../shared/models/Photo.model';
import { map } from 'rxjs/operators';

interface PhotosResponse {
  total: number;
  photos: Photo[];
}

@Injectable({
  providedIn: 'root'
})
export class PhotosService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/photos`;

getPhotosByEvent(eventId: string) {

    return this.http
        .get<PhotosResponse>(
            `${this.base}/event/${eventId}`
        )
        .pipe(
            map(res => res.photos)
        );

}
 uploadPhoto(
  eventId: string,
  guestId: string,
  file: File
) {

  const form = new FormData();

  form.append('photo', file);
  form.append('eventId', eventId);
  form.append('guestId', guestId);

  return this.http.post<{
    message: string;
    photo: Photo;
  }>(
    `${this.base}/upload`,
    form
  );

}
  deletePhoto(photoId: string) {
    return this.http.delete<void>(`${this.base}/${photoId}`);
  }

  downloadZip(eventId: string) {
  return this.http.get(`${this.base}/event/${eventId}/download`, {
    responseType: 'blob'
  });
}

}
