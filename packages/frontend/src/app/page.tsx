"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createPassage,
  deletePassage,
  fetchPassages,
  fetchVehicleTypes
} from "@/lib/api";
import type {
  CreatePassagePayload,
  Passage,
  VehicleTypeOption
} from "@/types";

interface FormState {
  vehicleId: string;
  vehicleType: string;
  timestamp: string;
}

const INITIAL_FORM: FormState = {
  vehicleId: "",
  vehicleType: "car",
  timestamp: ""
};

const FALLBACK_VEHICLE_TYPES: VehicleTypeOption[] = [
  { vehicleType: "car", tollFree: false }
];

export default function HomePage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOption[]>(
    FALLBACK_VEHICLE_TYPES
  );
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [types, currentPassages] = await Promise.all([
        fetchVehicleTypes(),
        fetchPassages()
      ]);
      setVehicleTypes(types);
      setPassages(currentPassages);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load initial data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPassages = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchPassages();
      setPassages(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh passages. Please try again."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.timestamp) {
      setError("Please provide a passage time.");
      return;
    }

    const parsedDate = new Date(form.timestamp);

    if (Number.isNaN(parsedDate.getTime())) {
      setError("Please enter a valid passage time.");
      return;
    }

    const payload: CreatePassagePayload = {
      vehicleId: form.vehicleId.trim(),
      vehicleType: form.vehicleType,
      timestamp: parsedDate.toISOString()
    };

    try {
      setSubmitting(true);
      await createPassage(payload);
      setForm(INITIAL_FORM);
      await refreshPassages();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to create passage."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePassage(id);
      await refreshPassages();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to delete passage."
      );
    }
  };

  const totalCharged = useMemo(
    () => passages.reduce((sum, passage) => sum + passage.chargedFee, 0),
    [passages]
  );

  const formatVehicleType = useCallback((value: string) => {
    if (!value) {
      return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }, []);

  const lastUpdated = useMemo(() => {
    if (passages.length === 0) {
      return null;
    }

    const latest = passages.reduce((mostRecent, current) =>
      new Date(current.timestamp) > new Date(mostRecent.timestamp)
        ? current
        : mostRecent
    );

    return new Date(latest.timestamp);
  }, [passages]);

  return (
    <main className="section">
      <div className="container">
        <div className="mb-5">
          <h1 className="title">Toll Passage Manager</h1>
          <p className="subtitle">
            Track daily toll fees, stay under the 60 SEK cap, and review which
            passages were actually charged.
          </p>
          {error && (
            <div className="notification is-danger" data-testid="error-banner">
              {error}
            </div>
          )}
          {loading && (
            <div className="notification is-info">Loading data…</div>
          )}
        </div>

        <div className="columns">
          <div className="column is-one-third">
            <section className="box">
              <h2 className="title is-5">Log A Passage</h2>
              <form onSubmit={handleSubmit} className="form">
                <div className="field">
                  <label className="label" htmlFor="vehicleId">
                    Vehicle Identifier
                  </label>
                  <div className="control">
                    <input
                      id="vehicleId"
                      className="input"
                      type="text"
                      placeholder="e.g. ABC123"
                      value={form.vehicleId}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          vehicleId: event.target.value
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label" htmlFor="vehicleType">
                    Vehicle Type
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        id="vehicleType"
                        value={form.vehicleType}
                        onChange={(event) =>
                          setForm((state) => ({
                            ...state,
                            vehicleType: event.target.value
                          }))
                        }
                      >
                        {vehicleTypes.map(({ vehicleType, tollFree }) => (
                          <option key={vehicleType} value={vehicleType}>
                            {formatVehicleType(vehicleType)}
                            {tollFree ? " (toll free)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label" htmlFor="timestamp">
                    Passage Time
                  </label>
                  <div className="control">
                    <input
                      id="timestamp"
                      className="input"
                      type="datetime-local"
                      value={form.timestamp}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          timestamp: event.target.value
                        }))
                      }
                      required
                    />
                  </div>
                  <p className="help">
                    The backend applies the 60 minute rule, peak fees, weekends and
                    holidays automatically.
                  </p>
                </div>

                <div className="field is-grouped is-grouped-right">
                  <div className="control">
                    <button
                      className={`button is-link${submitting ? " is-loading" : ""}`}
                      type="submit"
                      disabled={submitting}
                    >
                      Add Passage
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <section className="box">
              <h2 className="title is-5">Daily Overview</h2>
              <p><strong>Entries logged:</strong> {passages.length}</p>
              <p>
                <strong>Total charged:</strong> {totalCharged.toFixed(0)} SEK
              </p>
              {lastUpdated && (
                <p>
                  <strong>Last passage:</strong>{" "}
                  {lastUpdated.toLocaleString()}
                </p>
              )}
            </section>
          </div>

          <div className="column">
            <section className="box">
              <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
                <h2 className="title is-5 mb-0">Passage History</h2>
                <button
                  className={`button is-small is-light${refreshing ? " is-loading" : ""}`}
                  onClick={() => void refreshPassages()}
                  disabled={refreshing}
                >
                  Refresh
                </button>
              </div>

              {passages.length === 0 ? (
                <p>No passages logged yet. Add one to see the calculated fees.</p>
              ) : (
                <div className="table-container">
                  <table className="table is-fullwidth is-striped">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th>Base Fee</th>
                        <th>Charged</th>
                        <th>Daily Total</th>
                        <th aria-label="actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {passages.map((passage) => (
                        <tr key={passage.id}>
                          <td>{new Date(passage.timestamp).toLocaleString()}</td>
                          <td>{passage.vehicleId}</td>
                          <td>{formatVehicleType(passage.vehicleType)}</td>
                          <td>{passage.baseFee} SEK</td>
                          <td>{passage.chargedFee} SEK</td>
                          <td>{passage.dailyTotal} SEK</td>
                          <td className="has-text-right">
                            <button
                              className="button is-danger is-light is-small"
                              onClick={() => void handleDelete(passage.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
