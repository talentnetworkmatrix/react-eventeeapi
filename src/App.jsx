import { useState, useEffect } from 'react'

function App() {
  const [workshop, setWorkshop] = useState(null)
  const [token, setToken] = useState('')
  const [idLecture, setIdLecture] = useState('')
  const [attendees, setAttendees] = useState([])

  useEffect(() => {
    // getAttendeesFromEventeeApi();
  }, [])

  const getAttendeesFromEventeeApi = async (i) => {
    const response = await fetch(`https://eventee.co/api/v1/booking/${workshop.booking_info[0].id}/attendees?order_by=order&ascending=1&per_page=50&page=${i}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data;
  }

  const downloadAttendees = async () => {
    const repetitions = Math.ceil((workshop.capacity - workshop.available) / 50);
    const promises = [];
    for (let i = 1; i <= repetitions; i++) {
      await promises.push(getAttendeesFromEventeeApi(i));
    }
    const data = await Promise.all(promises);
    const attendees = data.map((d) => d.data).flat();
    setAttendees(attendees);
    const attendeesOnlyNameandEmail = attendees.map((a) => {
      return {
        name: a.name,
        email: a.email
      }
    })
    // ---------------------------
    // Download CSV
    // ---------------------------
    downloadCsv(attendeesOnlyNameandEmail, `asistentes_workshop_${workshop.name}.csv`);
  }

  const downloadCsv = (data, filename) => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
    a.download = filename;
    a.click();
  }

  const getLectureFromEventeeApi = async () => {
    const response = await fetch(`https://eventee.co/api/v1/lecture/${idLecture}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setWorkshop(data);
  }

  return (
    <div className="bg-gray-800 h-screen text-white p-5">
      <h1 className="text-3xl font-bold underline text-center">
        React + Eventee API
      </h1>

      <div className='flex gap-5 w-full mt-10'>
        <div className='grid gap-2 w-full'>
          <label htmlFor="idlecture">ID de la Conferencia o Workshop</label>
          <input
            type="text"
            name='idlecture'
            id='idlecture'
            placeholder='Ej. 65055'
            onChange={(e) => setIdLecture(e.target.value) }
            className='bg-gray-700 text-white p-2 rounded'
            />
        </div>
        <div className='grid gap-2 w-full'>
          <label htmlFor="token">Bearer Token</label>
          <input
            type="text"
            name='token'
            id='token'
            placeholder='Ej. eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3M...'
            onChange={(e) => setToken(e.target.value) }
            className='bg-gray-700 text-white p-2 rounded'
            />
        </div>
      </div>
      <button
        onClick={getLectureFromEventeeApi}
        className='bg-gray-950 text-white p-2 rounded-lg mt-4'
      >
        Buscar Conferencia / Workshop
      </button>

      {workshop && (
        <div className='bg-white rounded-lg p-5 mt-10 text-gray-900 grid gap-3'>
          <h4 className='text-xl font-bold underline'>Datos de la Conferencia / Workshop</h4>
          <p>Nombre: {workshop.name}</p>
          <p>Description: {workshop.description.replace(/<[^>]+>/g, '')}</p>
          <p>Fechas: {workshop.start} - {workshop.end}</p>
          <p>Capacidad: {workshop.capacity}</p>
          <p>No. Asistentes: {workshop.capacity - workshop.available}</p>
          <p>Disponibles: {workshop.available}</p>
          <button className='bg-gray-950 text-white p-2 rounded-lg mt-4' onClick={downloadAttendees}>
            Descargar lista de asistentes
          </button>
        </div>
      )}

    </div>
  )
}

export default App
