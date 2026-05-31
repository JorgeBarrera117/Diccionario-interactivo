FROM nginx:alpine

# Copiar todos los archivos estáticos al directorio que sirve Nginx por defecto
COPY . /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
