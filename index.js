
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// CONEXIÓN A MONGODB ATLAS
// ==========================================

const MONGO_URI = (process.env.MONGO_URI || '').trim();

if (!MONGO_URI.startsWith('mongodb://') &&
    !MONGO_URI.startsWith('mongodb+srv://')) {
    console.error('Error: MONGO_URI no tiene un formato válido.');
    console.error('Verifica la variable MONGO_URI en Render.');
    process.exit(1);
}

// ==========================================
// MODELO DE EMPLEADOS
// ==========================================

const empleadoSchema = new mongoose.Schema({
    Clave: {
        type: Number,
        required: true,
        unique: true
    },
    Nombre: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    fechadenacimiento: {
        type: Date,
        required: true
    },
    sexo: {
        type: String,
        required: true
    },
    tipodesangre: {
        type: String,
        required: true
    }
});

const Empleado = mongoose.model('Empleado', empleadoSchema, 'Empleados');

// ==========================================
// GET - ESTADO DE LA API
// ==========================================

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de Empleados funcionando correctamente',
        baseDeDatos: mongoose.connection.readyState === 1
            ? 'MongoDB Atlas conectado'
            : 'MongoDB Atlas desconectado'
    });
});

// ==========================================
// GET - OBTENER TODOS LOS EMPLEADOS
// ==========================================

app.get('/api/empleados', async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.status(200).json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// ==========================================
// GET - BUSCAR EMPLEADO POR CLAVE
// ==========================================

app.get('/api/empleados/:clave', async (req, res) => {
    try {
        const clave = Number(req.params.clave);

        if (!Number.isInteger(clave)) {
            return res.status(400).json({ mensaje: 'Clave inválida' });
        }

        const empleado = await Empleado.findOne({ Clave: clave });

        if (!empleado) {
            return res.status(404).json({
                mensaje: 'Empleado no encontrado'
            });
        }

        res.status(200).json(empleado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// ==========================================
// POST - REGISTRAR EMPLEADO
// ==========================================

app.post('/api/empleados', async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        const guardado = await nuevoEmpleado.save();

        res.status(201).json({
            mensaje: 'Empleado registrado correctamente',
            empleado: guardado
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                mensaje: 'Ya existe un empleado con esa Clave'
            });
        }

        res.status(400).json({ mensaje: error.message });
    }
});

// ==========================================
// PUT - ACTUALIZAR EMPLEADO
// ==========================================

app.put('/api/empleados/:clave', async (req, res) => {
    try {
        const clave = Number(req.params.clave);

        if (!Number.isInteger(clave)) {
            return res.status(400).json({ mensaje: 'Clave inválida' });
        }

        const campos = [
            'Nombre',
            'direccion',
            'fechadenacimiento',
            'sexo',
            'tipodesangre'
        ];

        const datos = {};

        for (const campo of campos) {
            if (req.body[campo] !== undefined) {
                datos[campo] = req.body[campo];
            }
        }

        if (Object.keys(datos).length === 0) {
            return res.status(400).json({
                mensaje: 'No se proporcionaron datos para actualizar'
            });
        }

        const actualizado = await Empleado.findOneAndUpdate(
            { Clave: clave },
            { $set: datos },
            { new: true, runValidators: true }
        );

        if (!actualizado) {
            return res.status(404).json({
                mensaje: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Empleado actualizado correctamente',
            empleado: actualizado
        });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// ==========================================
// DELETE - ELIMINAR EMPLEADO
// ==========================================

app.delete('/api/empleados/:clave', async (req, res) => {
    try {
        const clave = Number(req.params.clave);

        if (!Number.isInteger(clave)) {
            return res.status(400).json({ mensaje: 'Clave inválida' });
        }

        const eliminado = await Empleado.findOneAndDelete({
            Clave: clave
        });

        if (!eliminado) {
            return res.status(404).json({
                mensaje: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Empleado eliminado correctamente',
            empleado: eliminado
        });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// ==========================================
// INICIAR API EN RENDER O LOCALHOST
// ==========================================

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Conectado exitosamente a MongoDB Atlas');

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
})
.catch(error => {
    console.error('Error de conexión a MongoDB:', error.message);
    process.exit(1);
});
