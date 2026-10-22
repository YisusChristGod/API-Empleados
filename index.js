require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
.catch(err => console.error('Error de conexión:', err));

// Modelo de la colección Empleados
const empleadoSchema = new mongoose.Schema({
    Clave: { type: Number, required: true, unique: true },
    Nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    fechadenacimiento: { type: Date, required: true },
    sexo: { type: String, required: true },
    tipodesangre: { type: String, required: true }
});

const Empleado = mongoose.model('Empleado', empleadoSchema, 'Empleados');

// GET: Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// GET: Obtener empleado por Clave
app.get('/api/empleados/:clave', async (req, res) => {
    try {
        const empleado = await Empleado.findOne({ Clave: req.params.clave });
        if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        res.json(empleado);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// POST: Insertar empleado
app.post('/api/empleados', async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        const guardado = await nuevoEmpleado.save();
        res.status(201).json(guardado);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// PUT: Actualizar empleado por Clave
app.put('/api/empleados/:clave', async (req, res) => {
    try {
        const actualizado = await Empleado.findOneAndUpdate(
            { Clave: req.params.clave },
            req.body,
            { new: true, runValidators: true }
        );
        if (!actualizado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// DELETE: Eliminar empleado por Clave
app.delete('/api/empleados/:clave', async (req, res) => {
    try {
        const eliminado = await Empleado.findOneAndDelete({ Clave: req.params.clave });
        if (!eliminado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
        res.json({ mensaje: 'Empleado eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// Iniciar servidor
app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
