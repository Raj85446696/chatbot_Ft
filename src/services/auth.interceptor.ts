import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token && req.url.startsWith(environment.BASE_API_URL)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
