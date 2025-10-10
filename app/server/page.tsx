import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ServerPage() {
  // Capture start time for query timing
  const queryStartTime = Date.now();
  const serverTime = new Date().toISOString();

  // Test database connection by counting locations
  let dbConnectionStatus = 'Unknown';
  let locationCount = 0;
  let queryTimeMs = 0;
  let error = null;
  let sampleLocations: any[] = [];

  try {
    // Get count of locations
    locationCount = await prisma.location.count();

    // Get a few sample locations to prove we can read data
    sampleLocations = await prisma.location.findMany({
      take: 5,
      select: {
        id: true,
        city: true,
        state: true,
        population: true,
      },
      orderBy: {
        population: 'desc',
      },
    });

    dbConnectionStatus = 'Connected';
    queryTimeMs = Date.now() - queryStartTime;
  } catch (err: any) {
    dbConnectionStatus = 'Failed';
    error = err.message;
    queryTimeMs = Date.now() - queryStartTime;
  }

  const pageLoadTime = new Date().toISOString();

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#2563eb' }}>
        🔧 Server & Database Status
      </h1>

      {/* Connection Status Card */}
      <div style={{
        background: dbConnectionStatus === 'Connected' ? '#10b98120' : '#ef444420',
        border: `2px solid ${dbConnectionStatus === 'Connected' ? '#10b981' : '#ef4444'}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: dbConnectionStatus === 'Connected' ? '#10b981' : '#ef4444'
        }}>
          Database Connection: {dbConnectionStatus === 'Connected' ? '✅' : '❌'} {dbConnectionStatus}
        </h2>
        {error && (
          <div style={{
            background: '#fee',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            color: '#c00'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Timing Information */}
      <div style={{
        background: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏱️ Timing Information</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong>Query Time:</strong> <span style={{ color: '#2563eb', fontSize: '1.25rem' }}>{queryTimeMs}ms</span>
          </div>
          <div>
            <strong>Server Time (Query Start):</strong> <span style={{ color: '#2563eb' }}>{serverTime}</span>
          </div>
          <div>
            <strong>Page Load Time (Query Complete):</strong> <span style={{ color: '#2563eb' }}>{pageLoadTime}</span>
          </div>
          <div>
            <strong>Total Processing Time:</strong> <span style={{ color: '#2563eb', fontSize: '1.25rem' }}>
              {new Date(pageLoadTime).getTime() - new Date(serverTime).getTime()}ms
            </span>
          </div>
        </div>
      </div>

      {/* Database Stats */}
      {dbConnectionStatus === 'Connected' && (
        <>
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📊 Database Statistics</h2>
            <div style={{ fontSize: '1.125rem' }}>
              <strong>Total Locations in Database:</strong> <span style={{ color: '#2563eb', fontSize: '2rem', fontWeight: 'bold' }}>{locationCount}</span>
            </div>
          </div>

          {/* Sample Data */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📍 Sample Locations (Top 5 by Population)</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: '#2563eb', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>City</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>State</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Population</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleLocations.map((loc, idx) => (
                    <tr key={loc.id} style={{
                      background: idx % 2 === 0 ? '#f8fafc' : 'white',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <td style={{ padding: '1rem' }}>{loc.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{loc.city}</td>
                      <td style={{ padding: '1rem' }}>{loc.state}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {loc.population ? loc.population.toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* System Information */}
      <div style={{
        background: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>💻 System Information</h2>
        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
          <div><strong>Node Version:</strong> {process.version}</div>
          <div><strong>Platform:</strong> {process.platform}</div>
          <div><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</div>
          <div><strong>Database URL Set:</strong> {process.env.DATABASE_URL ? '✅ Yes' : '❌ No'}</div>
        </div>
      </div>

      {/* Back to Home */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href="/" style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          background: '#2563eb',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1.125rem'
        }}>
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
