import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BiHide } from "react-icons/bi";
import { BiShowAlt } from "react-icons/bi";

const Register = () => {

  const API = process.env.REACT_APP_BACKEND_URL;

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Aquí obtenemos la función para redirigir

  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {

    setError(null);
    setLoading(true);
  
    try {
      const response = await fetch(`${API}/Register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json(); // Convertir respuesta en JSON
  
      if (response.ok) {
        toast.success("Usuario creado exitosamente.");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // Si no es una respuesta OK, mostrar error
        toast.error(responseData.error || "Error al crear el usuario.");        
        setError(responseData.error || "Error al crear el usuario.");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err); // Mostrar errores de red o fetch
      toast.error("Error de conexión al servidor.");
      setError("Error de conexión al servidor.");
    }
  
    setLoading(false);
  };
  
  return (
    <div className="register-container">
      <form className='login-form' onSubmit={handleSubmit(onSubmit)}>
        <img src="/favicon.png" alt="Logo" className="logo" />
        <h2>Crear Cuenta</h2>
        
        <div className="form-group">
          <label htmlFor="username">Nombre Completo</label>
          <input
            id="fullname"
            type="text"
            placeholder="Ingrese su nombre completo"
            {...register("fullname", { required: "Este campo es obligatorio" })}
          />
          {errors.fullname && <span className="error-message">{errors.fullname.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input
            id="username"
            type="text"
            placeholder="Ingrese un nombre de usuario"
            {...register("username", { required: "Este campo es obligatorio" })}
          />
          {errors.username && <span className="error-message">{errors.username.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Ingrese un correo electrónico"
            {...register("email", { required: "Este campo es obligatorio", pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Correo inválido" } })}
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-input-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingrese una contraseña"
              {...register("password", { required: "Este campo es obligatorio", minLength: { value: 6, message: "La contraseña debe tener al menos 6 caracteres" } })}
            />
            
            <button type="button" className="icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ?  <BiShowAlt /> : <BiHide />}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>
        
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className='btn' disabled={loading}>Registrar</button>
        <p className="register-link">
            ¿Ya tienes una cuenta? <a href="/Login">Inicia sesión aquí</a>
        </p>

      </form>
    </div>
  );
};

export default Register;
