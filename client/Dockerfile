# Usa l'immagine ufficiale di Node.js
FROM node:18

# Imposta la directory di lavoro per l'app frontend
WORKDIR /app

# Copia il file package.json e package-lock.json (se presenti) nella cartella di lavoro
COPY client/package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il codice sorgente del frontend nella cartella di lavoro
COPY client/ .


# Esponi la porta su cui Vite ascolterà
EXPOSE 5173

# Avvia il server di sviluppo di Vite
CMD ["npm", "run", "dev"]
