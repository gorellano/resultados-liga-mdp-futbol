# Etapa de construcción (Build stage)
FROM node:20-alpine as build

# Directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm ci

# Copiamos el resto del código
COPY . .

# Argumentos para variables de entorno durante el build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Seteamos las variables como ENV para que vite las inyecte
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Construimos la aplicación estática
RUN npm run build

# Etapa de producción (Production stage)
FROM nginx:alpine

# Copiamos los archivos generados por vite al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos configuración custom de Nginx si es necesaria para React Router (SPA fallback)
# Como alternativa simple, inyectamos la directiva en la conf default:
RUN sed -i 's/location \/ {/location \/ {\n        try_files $uri $uri\/ \/index.html;/' /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos nginx
CMD ["nginx", "-g", "daemon off;"]
