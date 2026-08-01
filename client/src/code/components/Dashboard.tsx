import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import EventIcon from "@mui/icons-material/Event";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import * as Appointments from "../Appointments";

/* Parses the workflow's M/D/YYYY submission date; NaN-safe. */
const parseDate = (raw: string): Date | null => {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

/* Counts requests submitted within the last `days` days. */
const countWithin = (requests: Appointments.IBookingRequest[], days: number): number => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return requests.filter((r) => {
    const d = parseDate(r.submittedDate);
    return d !== null && d.getTime() >= cutoff;
  }).length;
};

/* A single headline stat card. */
const StatCard = ({ label, value }: { label: string, value: number }) => (
  <div className="statCard">
    <div className="statValue">{ value }</div>
    <div className="statLabel">{ label }</div>
  </div>
);

/* The appointments dashboard: headline stats plus a list of booking requests
   pulled from the Google Sheet via the server's /appointments endpoint. */
const Dashboard = () => {
  const [requests, setRequests] = useState<Appointments.IBookingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const worker = new Appointments.Worker();
        const data = await worker.listAppointments();
        if (active) { setRequests(data); }
      } catch (e) {
        if (active) { setError("Could not load appointments. Is the Google Sheet configured?"); }
      } finally {
        if (active) { setLoading(false); }
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="emptyState"><CircularProgress /></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashTitle">Appointments</h1>

      {/* Headline stats. */}
      <div className="statRow">
        <StatCard label="Total requests" value={ requests.length } />
        <StatCard label="This week" value={ countWithin(requests, 7) } />
        <StatCard label="This month" value={ countWithin(requests, 30) } />
      </div>

      {/* Error / empty / list. */}
      { error &&
        <div className="emptyState"><p>{ error }</p></div>
      }

      { !error && requests.length === 0 &&
        <div className="emptyState">
          <EventIcon className="emptyIcon" />
          <h2>No booking requests yet</h2>
          <p>New requests will appear here once they land in the sheet.</p>
        </div>
      }

      { !error && requests.length > 0 &&
        <div className="reqList">
          { requests.map((r, i) => (
            <div className="reqCard" key={ `${r.name}-${r.submittedDate}-${i}` }>
              <div className="reqHead">
                <span className="reqName">{ r.name || "Unknown" }</span>
                <span className="reqSubmitted">
                  <AccessTimeIcon fontSize="inherit" style={{ marginRight: 4 }} />
                  { r.submittedDate } { r.submittedTime }
                </span>
              </div>

              { r.phone &&
                <div className="reqPhone">
                  <PhoneIcon fontSize="inherit" style={{ marginRight: 6 }} />
                  <a href={ `tel:${r.phone}` }>{ r.phone }</a>
                </div>
              }

              {/* Column L. Rows written before that column existed have no
                  email, so this is absent rather than blank for them. */}
              { r.email &&
                <div className="reqPhone">
                  <EmailIcon fontSize="inherit" style={{ marginRight: 6 }} />
                  <a href={ `mailto:${r.email}` }>{ r.email }</a>
                </div>
              }

              { r.preferred.length > 0 &&
                <div className="reqSlots">
                  { r.preferred.map((slot, j) => (
                    <div className="slot" key={ j }>
                      <EventIcon fontSize="inherit" style={{ marginRight: 6, color: "#00b9ff" }} />
                      <span className="slotDate">{ slot.date || "-" }</span>
                      { slot.availability &&
                        <span className="slotAvail">· { slot.availability }</span>
                      }
                    </div>
                  )) }
                </div>
              }

              { r.notes &&
                <div className="reqNotes">{ r.notes }</div>
              }
            </div>
          )) }
        </div>
      }
    </div>
  );
};

export default Dashboard;