import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si ya está logueado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/inicio']);
    }

    // Crear el formulario reactivo
    this.loginForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      contraseña: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const loginData = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Login exitoso! Redirigiendo...';
          
          // Redirigir después de un breve delay para mostrar el mensaje de éxito
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 1500);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Intenta nuevamente.';
          console.error('Error en login:', error);
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      this.loginForm.markAllAsTouched();
    }
  }
}
