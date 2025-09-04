export default function HealthPage() {
  return (
    <div>
      <h1>OK</h1>
      <p>Service is healthy</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
