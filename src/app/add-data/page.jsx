"use client";

import { useEffect, useState } from "react";
import "../master.css";
import Link from "next/link";
import Swal from "sweetalert2";

export default function SignupPage() {
  const [newStandarId, setNewStandarId] = useState("");
  const [newOutput, setNewOutput] = useState("");
  const [newRejectedRate, setNewRejectedRate] = useState("");
  const [newDowntime, setNewDowntime] = useState("");
  const [standar, setStandar] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);

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
          setIsUserActive(data.user.isActive);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);hk
      }
    };

    fetchUser().then(() => {
      setLoading(false);
    });

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

    fetchStandar()

    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));
  }, []);

  const CreateActual = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/actual/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          standarId: newStandarId,
          output: newOutput,
          rejectRate: newRejectedRate,
          downtime: newDowntime,
        }),
      });
      const data = await response.json();
      if (response.ok) {
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
      setNewStandarId("");
      setNewOutput("");
      setNewDowntime("");
      setNewRejectedRate("");
    }
  };

  if (loading) {
    return (
      <div className="modal" style={{ display: "flex" }}>
        <div className="modal-content">
          <h3>Loading...</h3>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  if (!loading && !isUserActive) {
    setTimeout(() => {
      return (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3 className="mb-2.5">
              Status akun anda masih tidak active, silahkan hubungi admin untuk
              diaktifkan
            </h3>
            <Link
              href={"/"}
              className="p-2 bg-red-800 text-white rounded-md mt-2"
            >
              Kembali
            </Link>
          </div>
        </div>
      );
    }, 2000);
  }

  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="modal-content">
        <h3>
          Tambah Data Produksi <b>Aktual</b>
        </h3>
        <label>
          Mesin:
          <select
            id="inputMesin"
            value={newStandarId}
            onChange={(e) => setNewStandarId(e.target.value)}
          >
            <option value="">-- Pilih Mesin --</option>
            {standar.map((s, i) => (
              <option key={i} value={s._id.toString()}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Output Aktual:
          <input
            type="number"
            id="inputOutput"
            value={newOutput}
            onChange={(e) => setNewOutput(e.target.value)}
          />
        </label>
        <label>
          Reject Aktual:
          <input
            type="number"
            id="inputReject"
            value={newRejectedRate}
            onChange={(e) => setNewRejectedRate(e.target.value)}
          />
        </label>
        <label>
          Downtime Aktual (jam):
          <input
            type="number"
            id="inputDowntime"
            value={newDowntime}
            onChange={(e) => setNewDowntime(e.target.value)}
          />
        </label>
        <button className="btn" onClick={CreateActual}>
          Simpan
        </button>
        <Link
          href={"/"}
          className="ml-2.5 p-2 bg-red-800 text-white rounded-md mt-2"
        >
          Kembali
        </Link>
      </div>
    </div>
  );
}
