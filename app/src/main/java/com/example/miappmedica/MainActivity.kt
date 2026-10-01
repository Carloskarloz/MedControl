package com.example.miappmedica

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// Definición de colores
val VerdeExito = Color(0xFF4CAF50)
val AzulPrincipal = Color(0xFF1976D2)

// Modelo de datos para un medicamento
data class Medicamento(
    val id: Int,
    val nombre: String,
    val dosis: String,
    val horario: String,
    var tomadasHoy: Int,
    val dosisDiariasTotal: Int
)

// Modelo de datos para el Perfil Clínico del Paciente
data class DatosPaciente(
    val nombre: String,
    val edad: String,
    val tipoSangre: String,
    val alergias: String,
    val telefonoPropio: String,
    val contactoEmergencia: String
)

// Modelo de datos para un registro del historial
data class RegistroHistorial(
    val id: Int,
    val fecha: String,
    val medicamento: String,
    val dosis: String,
    val horaRegistrada: String,
    val fueTomada: Boolean
)

// Elementos de la barra inferior
sealed class PantallaNavegacion(val ruta: String, val titulo: String, val icono: ImageVector) {
    object Medicamentos : PantallaNavegacion("medicamentos", "Remedios", Icons.Default.Home)
    object Perfil : PantallaNavegacion("perfil", "Perfil", Icons.Default.Person)
    object Historial : PantallaNavegacion("historial", "Historial", Icons.Default.DateRange)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    NavHost(
                        navController = navController,
                        startDestination = "login"
                    ) {
                        // RUTA 1: LOGIN
                        composable("login") {
                            PantallaLogin(
                                onLoginExitoso = { paciente ->
                                    navController.navigate("contenedor_principal/${paciente.nombre}/${paciente.edad}/${paciente.tipoSangre}/${paciente.alergias}/${paciente.telefonoPropio}/${paciente.contactoEmergencia}") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                },
                                onIrARegistro = {
                                    navController.navigate("registro")
                                }
                            )
                        }

                        // RUTA 2: REGISTRO DE NUEVO USUARIO
                        composable("registro") {
                            PantallaRegistro(
                                onRegistroExitoso = { paciente ->
                                    navController.navigate("contenedor_principal/${paciente.nombre}/${paciente.edad}/${paciente.tipoSangre}/${paciente.alergias}/${paciente.telefonoPropio}/${paciente.contactoEmergencia}") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                },
                                onVolverALogin = {
                                    navController.popBackStack()
                                }
                            )
                        }

                        // RUTA 3: CONTENEDOR PRINCIPAL CON DATOS DEL PACIENTE
                        composable("contenedor_principal/{nombre}/{edad}/{tipoSangre}/{alergias}/{telefonoPropio}/{contactoEmergencia}") { backStackEntry ->
                            val paciente = DatosPaciente(
                                nombre = backStackEntry.arguments?.getString("nombre") ?: "Usuario",
                                edad = backStackEntry.arguments?.getString("edad") ?: "No especificada",
                                tipoSangre = backStackEntry.arguments?.getString("tipoSangre") ?: "No especificado",
                                alergias = backStackEntry.arguments?.getString("alergias") ?: "Ninguna",
                                telefonoPropio = backStackEntry.arguments?.getString("telefonoPropio") ?: "Sin registro",
                                contactoEmergencia = backStackEntry.arguments?.getString("contactoEmergencia") ?: "Sin registro"
                            )
                            ContenedorPrincipal(
                                datosPaciente = paciente,
                                onCerrarSesion = {
                                    navController.navigate("login") {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// PANTALLA 1: LOGIN
// ==========================================
@Composable
fun PantallaLogin(
    onLoginExitoso: (DatosPaciente) -> Unit,
    onIrARegistro: () -> Unit
) {
    val context = LocalContext.current
    val sharedPref = remember { context.getSharedPreferences("datos_medicos_pref", Context.MODE_PRIVATE) }

    var usuarioInput by remember { mutableStateOf("") }
    var contrasenaInput by remember { mutableStateOf("") }
    var mensajeError by remember { mutableStateOf("") }
    var usuarioNoExiste by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "¡Bienvenido!",
            style = MaterialTheme.typography.headlineLarge
        )
        Text(
            text = "Acceso a tu App Médica",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        OutlinedTextField(
            value = usuarioInput,
            onValueChange = {
                usuarioInput = it
                usuarioNoExiste = false
                mensajeError = ""
            },
            label = { Text("Nombre de Usuario") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = contrasenaInput,
            onValueChange = {
                contrasenaInput = it
                usuarioNoExiste = false
                mensajeError = ""
            },
            label = { Text("Contraseña") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
        )

        if (mensajeError.isNotEmpty()) {
            Text(
                text = mensajeError,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                if (usuarioInput.isBlank() || contrasenaInput.isBlank()) {
                    mensajeError = "Por favor completa ambos campos"
                    usuarioNoExiste = false
                } else {
                    val guardadoExiste = sharedPref.contains("nombre")
                    val nombreGuardado = sharedPref.getString("nombre", "") ?: ""
                    val contrasenaGuardada = sharedPref.getString("contrasena", "") ?: ""

                    if (guardadoExiste && (usuarioInput.equals(nombreGuardado, ignoreCase = true)) && contrasenaInput == contrasenaGuardada) {
                        val pacienteCargado = DatosPaciente(
                            nombre = nombreGuardado,
                            edad = sharedPref.getString("edad", "No especificada") ?: "No especificada",
                            tipoSangre = sharedPref.getString("tipoSangre", "No especificado") ?: "No especificado",
                            alergias = sharedPref.getString("alergias", "Ninguna") ?: "Ninguna",
                            telefonoPropio = sharedPref.getString("telefonoPropio", "Sin registro") ?: "Sin registro",
                            contactoEmergencia = sharedPref.getString("contactoEmergencia", "Sin registro") ?: "Sin registro"
                        )
                        onLoginExitoso(pacienteCargado)
                    } else {
                        mensajeError = "Usuario no registrado o credenciales incorrectas."
                        usuarioNoExiste = true
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AzulPrincipal)
        ) {
            Text("Iniciar Sesión")
        }

        if (usuarioNoExiste) {
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onIrARegistro,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(45.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
            ) {
                Text("Ir a Registrarse Ahora")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "¿No tienes una cuenta? Regístrate aquí",
            color = AzulPrincipal,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.clickable { onIrARegistro() }
        )
    }
}

// ==========================================
// PANTALLA 2: REGISTRO CON RESTRICCION DE CAMPOS
// ==========================================
@Composable
fun PantallaRegistro(
    onRegistroExitoso: (DatosPaciente) -> Unit,
    onVolverALogin: () -> Unit
) {
    val context = LocalContext.current
    val sharedPref = remember { context.getSharedPreferences("datos_medicos_pref", Context.MODE_PRIVATE) }

    var nombreCompleto by remember { mutableStateOf("") }
    var edad by remember { mutableStateOf("") }
    var tipoSangre by remember { mutableStateOf("") }
    var alergias by remember { mutableStateOf("") }
    var telefonoPropio by remember { mutableStateOf("") }
    var contactoEmergencia by remember { mutableStateOf("") }
    var contrasena by remember { mutableStateOf("") }
    var mensajeError by remember { mutableStateOf("") }

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(scrollState),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Ficha del Paciente",
            style = MaterialTheme.typography.headlineLarge
        )
        Text(
            text = "Ingresa tus datos personales y médicos",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        OutlinedTextField(
            value = nombreCompleto,
            onValueChange = { input ->
                if (input.all { char -> char.isLetter() || char.isWhitespace() }) {
                    nombreCompleto = input
                }
            },
            label = { Text("Nombre Completo") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text)
        )

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = edad,
                onValueChange = { input ->
                    if (input.all { char -> char.isDigit() } && input.length <= 3) {
                        edad = input
                    }
                },
                label = { Text("Edad (ej. 30)") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )

            OutlinedTextField(
                value = tipoSangre,
                onValueChange = { input ->
                    if (input.all { char -> char.isLetter() || char == '+' || char == '-' } && input.length <= 4) {
                        tipoSangre = input.uppercase()
                    }
                },
                label = { Text("Sangre (ej. O+)") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = alergias,
            onValueChange = { alergias = it },
            label = { Text("Alergias (ej. Penicilina, Ninguna)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = telefonoPropio,
            onValueChange = { input ->
                if (input.all { char -> char.isDigit() }) {
                    telefonoPropio = input
                }
            },
            label = { Text("Tu Teléfono (solo números)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = contactoEmergencia,
            onValueChange = { input ->
                if (input.all { char -> char.isDigit() }) {
                    contactoEmergencia = input
                }
            },
            label = { Text("Contacto Emergencia (solo números)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = contrasena,
            onValueChange = { contrasena = it },
            label = { Text("Contraseña") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
        )

        if (mensajeError.isNotEmpty()) {
            Text(
                text = mensajeError,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {
                if (nombreCompleto.isNotBlank() && contrasena.isNotBlank()) {
                    val edadTexto = if (edad.isNotBlank()) "$edad años" else "No especificada"
                    val sangreTexto = if (tipoSangre.isNotBlank()) tipoSangre else "No especificado"
                    val alergiasTexto = if (alergias.isNotBlank()) alergias else "Ninguna"
                    val telPropioTexto = if (telefonoPropio.isNotBlank()) "+56 $telefonoPropio" else "Sin registro"
                    val telEmergenciaTexto = if (contactoEmergencia.isNotBlank()) "+56 $contactoEmergencia" else "Sin registro"

                    sharedPref.edit().apply {
                        putString("nombre", nombreCompleto)
                        putString("edad", edadTexto)
                        putString("tipoSangre", sangreTexto)
                        putString("alergias", alergiasTexto)
                        putString("telefonoPropio", telPropioTexto)
                        putString("contactoEmergencia", telEmergenciaTexto)
                        putString("contrasena", contrasena)
                        apply()
                    }

                    val nuevoPaciente = DatosPaciente(
                        nombre = nombreCompleto,
                        edad = edadTexto,
                        tipoSangre = sangreTexto,
                        alergias = alergiasTexto,
                        telefonoPropio = telPropioTexto,
                        contactoEmergencia = telEmergenciaTexto
                    )
                    onRegistroExitoso(nuevoPaciente)
                } else {
                    mensajeError = "Por favor completa tu Nombre y Contraseña"
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AzulPrincipal)
        ) {
            Text("Registrar y Guardar Ficha")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "¿Ya tienes cuenta? Volver al inicio de sesión",
            color = AzulPrincipal,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.clickable { onVolverALogin() }
        )
    }
}

// ==========================================
// CONTENEDOR CON PERSISTENCIA DE MEDICAMENTOS E HISTORIAL
// ==========================================
@Composable
fun ContenedorPrincipal(
    datosPaciente: DatosPaciente,
    onCerrarSesion: () -> Unit
) {
    val context = LocalContext.current
    val sharedPref = remember { context.getSharedPreferences("datos_medicos_pref", Context.MODE_PRIVATE) }
    val gson = remember { Gson() }

    val navControllerInterno = rememberNavController()
    val itemsNavegacion = listOf(
        PantallaNavegacion.Medicamentos,
        PantallaNavegacion.Perfil,
        PantallaNavegacion.Historial
    )

    // CARGAR MEDICAMENTOS GUARDADOS DESDE SHAREDPREFERENCES
    var listaMedicamentos by remember {
        val jsonMed = sharedPref.getString("lista_medicamentos", null)
        val tipoLista = object : TypeToken<List<Medicamento>>() {}.type
        val medicamentosGuardados: List<Medicamento> = if (jsonMed != null) {
            gson.fromJson(jsonMed, tipoLista)
        } else emptyList()

        mutableStateOf(medicamentosGuardados)
    }

    // CARGAR HISTORIAL GUARDADO DESDE SHAREDPREFERENCES
    var historialDosis by remember {
        val jsonHist = sharedPref.getString("lista_historial", null)
        val tipoLista = object : TypeToken<List<RegistroHistorial>>() {}.type
        val historialGuardado: List<RegistroHistorial> = if (jsonHist != null) {
            gson.fromJson(jsonHist, tipoLista)
        } else emptyList()

        mutableStateOf(historialGuardado)
    }

    // FUNCIÓN AUXILIAR PARA GUARDAR EN MEMORIA
    fun guardarListasEnDisco(meds: List<Medicamento>, hist: List<RegistroHistorial>) {
        val jsonMeds = gson.toJson(meds)
        val jsonHist = gson.toJson(hist)
        sharedPref.edit().apply {
            putString("lista_medicamentos", jsonMeds)
            putString("lista_historial", jsonHist)
            apply()
        }
    }

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navControllerInterno.currentBackStackEntryAsState()
                val rutaActual = navBackStackEntry?.destination?.route

                itemsNavegacion.forEach { pantalla ->
                    NavigationBarItem(
                        icon = { Icon(pantalla.icono, contentDescription = pantalla.titulo) },
                        label = { Text(pantalla.titulo) },
                        selected = rutaActual == pantalla.ruta,
                        onClick = {
                            if (rutaActual != pantalla.ruta) {
                                navControllerInterno.navigate(pantalla.ruta) {
                                    popUpTo(navControllerInterno.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navControllerInterno,
            startDestination = PantallaNavegacion.Medicamentos.ruta,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(PantallaNavegacion.Medicamentos.ruta) {
                PantallaListaMedicamentos(
                    listaMedicamentos = listaMedicamentos,
                    onAgregarMedicamento = { nuevo ->
                        val nuevaLista = listaMedicamentos + nuevo
                        listaMedicamentos = nuevaLista
                        guardarListasEnDisco(nuevaLista, historialDosis)
                    },
                    onRegistrarDosis = { medId ->
                        var medEncontrado: Medicamento? = null
                        val nuevaListaMeds = listaMedicamentos.map {
                            if (it.id == medId && it.tomadasHoy < it.dosisDiariasTotal) {
                                medEncontrado = it
                                it.copy(tomadasHoy = it.tomadasHoy + 1)
                            } else it
                        }
                        listaMedicamentos = nuevaListaMeds

                        var nuevoHistorial = historialDosis
                        medEncontrado?.let { med ->
                            val horaActual = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
                            val nuevoRegistro = RegistroHistorial(
                                id = (historialDosis.maxOfOrNull { h -> h.id } ?: 0) + 1,
                                fecha = "Hoy",
                                medicamento = "${med.nombre} ${med.dosis}",
                                dosis = "1 Dosis",
                                horaRegistrada = horaActual,
                                fueTomada = true
                            )
                            nuevoHistorial = listOf(nuevoRegistro) + historialDosis
                            historialDosis = nuevoHistorial
                        }

                        guardarListasEnDisco(nuevaListaMeds, nuevoHistorial)
                    }
                )
            }
            composable(PantallaNavegacion.Perfil.ruta) {
                PantallaPerfil(datosPaciente = datosPaciente, onCerrarSesion = onCerrarSesion)
            }
            composable(PantallaNavegacion.Historial.ruta) {
                PantallaHistorial(historialDosis = historialDosis)
            }
        }
    }
}

// ==========================================
// PANTALLA 3: LISTA DE MEDICAMENTOS
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PantallaListaMedicamentos(
    listaMedicamentos: List<Medicamento>,
    onAgregarMedicamento: (Medicamento) -> Unit,
    onRegistrarDosis: (Int) -> Unit
) {
    var mostrarDialogo by remember { mutableStateOf(false) }

    val totalDosisDelDia = listaMedicamentos.sumOf { it.dosisDiariasTotal }
    val totalTomadas = listaMedicamentos.sumOf { it.tomadasHoy }
    val porcentajeAdherencia = if (totalDosisDelDia > 0) {
        (totalTomadas.toFloat() / totalDosisDelDia.toFloat()) * 100
    } else 0f

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tratamientos y Dosis") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { mostrarDialogo = true },
                containerColor = AzulPrincipal,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Agregar Medicamento")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Adherencia de Hoy",
                        style = MaterialTheme.typography.titleMedium
                    )
                    LinearProgressIndicator(
                        progress = { if (totalDosisDelDia > 0) porcentajeAdherencia / 100f else 0f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(10.dp),
                        color = VerdeExito,
                    )
                    Text(
                        text = if (totalDosisDelDia > 0)
                            "${porcentajeAdherencia.toInt()}% completado ($totalTomadas de $totalDosisDelDia dosis)"
                        else
                            "No hay dosis programadas para hoy",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            Text(
                text = "Medicamentos Activos",
                style = MaterialTheme.typography.titleLarge
            )

            if (listaMedicamentos.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No tienes medicamentos registrados.\nPresiona el botón (+) para agregar tu primer remedio.",
                        textAlign = TextAlign.Center,
                        color = Color.Gray,
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(listaMedicamentos) { med ->
                        TarjetaMedicamento(
                            medicamento = med,
                            onRegistrarDosis = onRegistrarDosis
                        )
                    }
                }
            }
        }

        if (mostrarDialogo) {
            DialogoAgregarMedicamento(
                onDismiss = { mostrarDialogo = false },
                onGuardar = { nuevoNombre, nuevaDosis, nuevoHorario, totalDosis ->
                    val nuevoId = (listaMedicamentos.maxOfOrNull { it.id } ?: 0) + 1
                    val nuevoMed = Medicamento(
                        id = nuevoId,
                        nombre = nuevoNombre,
                        dosis = nuevaDosis,
                        horario = nuevoHorario,
                        tomadasHoy = 0,
                        dosisDiariasTotal = totalDosis
                    )
                    onAgregarMedicamento(nuevoMed)
                    mostrarDialogo = false
                }
            )
        }
    }
}

// ==========================================
// PANTALLA 4: PERFIL DEL PACIENTE
// ==========================================
@Composable
fun PantallaPerfil(
    datosPaciente: DatosPaciente,
    onCerrarSesion: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Box(
            modifier = Modifier
                .size(100.dp)
                .clip(CircleShape)
                .background(AzulPrincipal),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = "Avatar",
                tint = Color.White,
                modifier = Modifier.size(60.dp)
            )
        }

        Text(
            text = datosPaciente.nombre,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = "Ficha del Paciente",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray
        )

        Divider(modifier = Modifier.padding(vertical = 4.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = AzulPrincipal)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Información Personal", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                Divider()
                Text("Nombre Completo: ${datosPaciente.nombre}")
                Text("Edad: ${datosPaciente.edad}")
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Favorite, contentDescription = null, tint = Color.Red)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Datos Clínicos", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                Divider()
                Text("Tipo de Sangre: ${datosPaciente.tipoSangre}")
                Text("Alergias Conocidas: ${datosPaciente.alergias}")
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Phone, contentDescription = null, tint = VerdeExito)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Teléfonos de Contacto", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                Divider()
                Text("Tu Teléfono: ${datosPaciente.telefonoPropio}")
                Text("Contacto de Emergencia: ${datosPaciente.contactoEmergencia}")
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
            onClick = onCerrarSesion,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
        ) {
            Icon(Icons.Default.ExitToApp, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Cerrar Sesión")
        }
    }
}

// ==========================================
// PANTALLA 5: HISTORIAL DINÁMICO
// ==========================================
@Composable
fun PantallaHistorial(historialDosis: List<RegistroHistorial>) {
    val totalTomas = historialDosis.size
    val tomasExitosas = historialDosis.count { it.fueTomada }
    val porcentajeExito = if (totalTomas > 0) (tomasExitosas * 100) / totalTomas else 0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Historial de Tomas",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Rendimiento Global",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (totalTomas > 0) "$tomasExitosas de $totalTomas dosis tomadas" else "Sin tomas registradas",
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                Surface(
                    shape = CircleShape,
                    color = AzulPrincipal,
                    contentColor = Color.White
                ) {
                    Text(
                        text = "$porcentajeExito%",
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Text(
            text = "Registro Reciente",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )

        if (historialDosis.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Aún no hay dosis registradas.\nAl tomar tus medicamentos aparecerá aquí el registro.",
                    textAlign = TextAlign.Center,
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(historialDosis) { registro ->
                    TarjetaRegistroHistorial(registro = registro)
                }
            }
        }
    }
}

@Composable
fun TarjetaRegistroHistorial(registro: RegistroHistorial) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = registro.medicamento,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${registro.fecha} - ${registro.horaRegistrada}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            Surface(
                shape = CircleShape,
                color = if (registro.fueTomada) VerdeExito.copy(alpha = 0.15f) else Color.Red.copy(alpha = 0.15f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = if (registro.fueTomada) Icons.Default.Check else Icons.Default.Close,
                        contentDescription = null,
                        tint = if (registro.fueTomada) VerdeExito else Color.Red,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = if (registro.fueTomada) "Tomada" else "Omitida",
                        color = if (registro.fueTomada) VerdeExito else Color.Red,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

// ==========================================
// DIÁLOGO Y TARJETA DE MEDICAMENTOS
// ==========================================
@Composable
fun DialogoAgregarMedicamento(
    onDismiss: () -> Unit,
    onGuardar: (nombre: String, dosis: String, horario: String, totalDosis: Int) -> Unit
) {
    var nombre by remember { mutableStateOf("") }
    var dosis by remember { mutableStateOf("") }
    var horario by remember { mutableStateOf("") }
    var totalDosisStr by remember { mutableStateOf("1") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nuevo Medicamento") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = nombre,
                    onValueChange = { nombre = it },
                    label = { Text("Nombre del fármaco") },
                    singleLine = true
                )
                OutlinedTextField(
                    value = dosis,
                    onValueChange = { dosis = it },
                    label = { Text("Dosis (ej. 500 mg)") },
                    singleLine = true
                )
                OutlinedTextField(
                    value = horario,
                    onValueChange = { horario = it },
                    label = { Text("Horarios (ej. Cada 8 hrs)") },
                    singleLine = true
                )
                OutlinedTextField(
                    value = totalDosisStr,
                    onValueChange = { input ->
                        if (input.all { char -> char.isDigit() }) {
                            totalDosisStr = input
                        }
                    },
                    label = { Text("Dosis diarias totales") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val totalDosis = totalDosisStr.toIntOrNull() ?: 1
                    if (nombre.isNotBlank() && dosis.isNotBlank()) {
                        onGuardar(nombre, dosis, horario, totalDosis)
                    }
                }
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
fun TarjetaMedicamento(
    medicamento: Medicamento,
    onRegistrarDosis: (Int) -> Unit
) {
    val completado = medicamento.tomadasHoy >= medicamento.dosisDiariasTotal

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = medicamento.nombre,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "Dosis: ${medicamento.dosis}",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "Horario: ${medicamento.horario}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
                Text(
                    text = "Progreso: ${medicamento.tomadasHoy}/${medicamento.dosisDiariasTotal} tomadas",
                    style = MaterialTheme.typography.labelMedium,
                    color = if (completado) VerdeExito else Color.Unspecified
                )
            }

            Button(
                onClick = { onRegistrarDosis(medicamento.id) },
                enabled = !completado,
                colors = ButtonDefaults.buttonColors(
                    containerColor = VerdeExito
                )
            ) {
                if (completado) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Completado",
                        tint = Color.White
                    )
                } else {
                    Text("Tomar")
                }
            }
        }
    }
}