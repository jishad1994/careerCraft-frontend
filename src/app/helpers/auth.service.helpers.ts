import { LoginResponseDTO, LoginResponseUserDTO } from '../models/auth.dto';

export function saveToStorage(response: LoginResponseDTO) {
  if (response.success && response.user && response.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('userRole', response.user?.role);
    localStorage.setItem('userEmail', response.user?.email);
  }
}
