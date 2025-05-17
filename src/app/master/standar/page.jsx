"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../../master.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default function DataProduksiMesin() {
  const [newName, setNewName] = useState("");
  const [newStandarId, setNewStandarId] = useState("");
  const [newOutput, setNewOutput] = useState("");
  const [newRejectedRate, setNewRejectedRate] = useState("");
  const [newDowntime, setNewDowntime] = useState("");
  const [data, setData] = useState([]);
  const [filterMesin, setFilterMesin] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalStandarOpen, setIsModalStandarOpen] = useState(false);

  const [csrfToken, setCsrfToken] = useState("");
  const [standar, setStandar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetStandar, setTargerStandar] = useState("");
  const [targetActual, setTargerActual] = useState("");
  const [isModalStandarEditOpen, setIsModalStandarEditOpen] = useState(false);
  const [updatedActual, setUpdatedActual] = useState([]);
  const [user, setUser] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setIsAdmin(data.user.isAdmin);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchStandar = async () => {
      try {
        const res = await fetch("/api/standar");
        const data = await res.json();

        if (res.ok) {
          setStandar(data.data);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));

    fetchUser();
    fetchStandar().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus data ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      icon: "warning",
    }).then(async () => {
      const res = await fetch("/api/actual/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id,
        }),
      });

      if (res.ok) {
        Swal.fire("Terhapus!", "", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  };

  const handleEdit = async () => {
    try {
      const res = await fetch("/api/actual/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id: targetActual,
          standarId: newStandarId,
          output: newOutput,
          rejectRate: newRejectedRate,
          downtime: newDowntime,
        }),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Data telah diupdate!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error("response tidak ok");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteStandar = (id) => {
    Swal.fire({
      title:
        "Yakin hapus data ini? Data Actual Terkait Juga mungkin akan Rusak Bila Data Standar Dihapus",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      icon: "warning",
    }).then(async () => {
      const res = await fetch("/api/standar/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id,
        }),
      });

      if (res.ok) {
        Swal.fire("Terhapus!", "", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  };

  const handleEditStandar = async () => {
    try {
      const res = await fetch("/api/standar/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id: targetStandar,
          name: newName,
          output: newOutput,
          rejectRate: newRejectedRate,
          downtime: newDowntime,
        }),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Data telah diupdate!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error("response tidak ok");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTargerStandar("");
      setLoading(false);
      setNewName("");
      setNewOutput("");
      setNewDowntime("");
      setNewRejectedRate("");
    }
  };

  const filteredData = updatedActual.filter((d) => {
    const isMesinMatch = !filterMesin || d.name === filterMesin;
    const isFromMatch = !filterFrom || new Date(d.date) >= new Date(filterFrom);
    const isToMatch = !filterTo || new Date(d.date) <= new Date(filterTo);
    return isMesinMatch && isFromMatch && isToMatch;
  });

  const CreateStandar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/standar/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          name: newName,
          output: newOutput,
          rejectRate: newRejectedRate,
          downtime: newDowntime,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setData((prev) => [...prev, data]);
        setIsModalOpen(false);
        Swal.fire("Berhasil", "Data telah disimpan!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        Swal.fire("Gagal", `${data.message}`, "error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setNewName("");
      setNewOutput("");
      setNewDowntime("");
      setNewRejectedRate("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading machine...</p>
      </div>
    );
  }

  if (!loading && !isAdmin) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
        <p>Halaman ini hanya dapat diakses oleh admin.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
      <button className="btn" onClick={() => setIsModalStandarOpen(true)}>
        + Tambah Data <b>Standar</b>
      </button>
      </div>

      <h2>
        Data Produksi <b>Standar</b> Mesin
      </h2>

      <table id="dataTable">
        <thead>
          <tr>
            <th>Mesin</th>
            <th>Std Output</th>
            <th>Std Reject</th>
            <th>Std Downtime (Jam)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          {standar.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.output}</td>
              <td>{d.rejectRate}</td>
              <td>{d.downtime}</td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => handleDeleteStandar(d._id.toString())}
                >
                  Hapus
                </button>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setIsModalStandarEditOpen(true);
                    setTargerStandar(d._id.toString());
                    setNewName(d.name);
                    setNewOutput(d.output);
                    setNewRejectedRate(d.rejectRate);
                    setNewDowntime(d.downtime);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Untuk Standar */}
      {isModalStandarOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>
              Tambah Data Produksi <b>Standar</b>
            </h3>

            <label>
              Machine Standar Name
              <input
                type="text"
                id="inputOutput"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <label>
              Standar Output:
              <input
                type="number"
                id="inputOutput"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
              />
            </label>
            <label>
              Standar Reject:
              <input
                type="number"
                id="inputReject"
                value={newRejectedRate}
                onChange={(e) => setNewRejectedRate(e.target.value)}
              />
            </label>
            <label>
              Standar Downtime (jam):
              <input
                type="number"
                id="inputDowntime"
                value={newDowntime}
                onChange={(e) => setNewDowntime(e.target.value)}
              />
            </label>
            <button className="btn" onClick={CreateStandar}>
              Simpan
            </button>
            <button
              className="cancel-btn btn"
              onClick={() => setIsModalStandarOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {isModalStandarEditOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>
              Edit Data Produksi <b>Standar</b>
            </h3>

            <label>
              Machine Standar Name
              <input
                type="text"
                id="inputOutput"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <label>
              Standar Output:
              <input
                type="number"
                id="inputOutput"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
              />
            </label>
            <label>
              Standar Reject:
              <input
                type="number"
                id="inputReject"
                value={newRejectedRate}
                onChange={(e) => setNewRejectedRate(e.target.value)}
              />
            </label>
            <label>
              Standar Downtime (jam):
              <input
                type="number"
                id="inputDowntime"
                value={newDowntime}
                onChange={(e) => setNewDowntime(e.target.value)}
              />
            </label>
            <button className="btn" onClick={handleEditStandar}>
              Edit
            </button>
            <button
              className="cancel-btn btn"
              onClick={() => setIsModalStandarEditOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
