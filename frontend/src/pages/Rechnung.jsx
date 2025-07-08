import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { getRechnungByReservierungsId, getRechnung, getVehicleById, getProfile } from '../api/api';
import {
    Container, Typography, Button, Box, Paper, Grid, 
    CircularProgress, Alert, Avatar, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function Rechnung() {
  const { rechnungID } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const reservierungsId = searchParams.get('reservation');
  const [rechnung, setRechnung] = useState(null);
  const [fahrzeug, setFahrzeug] = useState(null);
  const [kunde, setKunde] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        let rechnungRes;
        if (rechnungID) {
          rechnungRes = await getRechnung(rechnungID);
        } else {
          rechnungRes = await getRechnungByReservierungsId(reservierungsId);
        }
        if (!isMounted) return;
        setRechnung(rechnungRes.data);

        // Load vehicle data if available
        if (rechnungRes.data?.FahrzeugID) {
          const fahrzeugRes = await getVehicleById(rechnungRes.data.FahrzeugID);
          if (!isMounted) return;
          setFahrzeug(fahrzeugRes.data);
        }
        // Load customer data
        const kundeRes = await getProfile();
        if (!isMounted) return;
        setKunde(kundeRes.data.user || kundeRes.data);
      } catch (error) {
        console.error('Error loading invoice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [rechnungID, reservierungsId]);

  const fahrzeugInfo = fahrzeug
    ? [
      fahrzeug.Hersteller,
      fahrzeug.ModellName,
      fahrzeug.Kennzeichen
    ].filter(Boolean).join(' ')
    : '-';

  const preis = rechnung?.Preis || rechnung?.Gesamtpreis || '-';

  const kundeInfo = kunde
    ? [
        (kunde.Vorname || kunde.vorname || '') + " " + (kunde.Nachname || kunde.nachname || ''),
        (kunde.Strasse || kunde.strasse || '') + " " + (kunde.HausNummer || kunde.hausnummer || ''),
        (kunde.PLZ || kunde.plz || '') + " " + (kunde.Ort || kunde.ort || '')
      ].filter(line => line.trim()).join('\n')
    : t('invoice.customerDataNotAvailable');

  const bankInfo = kunde
    ? [
        kunde.IBAN || kunde.iban || '',
        kunde.BIC || kunde.bic || ''
      ].filter(Boolean).join('\n')
    : t('invoice.customerDataNotAvailable');

  const downloadPDF = () => {
    if (!rechnung) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(t('invoice.title'), 14, 18);

    doc.setFontSize(12);
    doc.text('Carvia GmbH\nMusterstraße 1\n12345 Musterstadt', 14, 30);

    doc.setFontSize(12);
    doc.text(t('invoice.customer') + ':', 14, 50);
    doc.text(kundeInfo, 14, 56);

    doc.text(t('invoice.bankInformation') + ':', 110, 50);
    doc.text(bankInfo, 110, 56);

    autoTable(doc, {
      startY: 80,
      head: [[t('invoice.service'), t('invoice.vehicle'), t('invoice.paid'), t('invoice.issueDate'), t('invoice.price')]],
      body: [
        [
          t('invoice.vehicleRental'),
          fahrzeugInfo || '-',
          rechnung.Bezahlt ? t('common.yes') : t('common.no'),
          rechnung.Austellungsdatum || '-',
          preis
        ]
      ]
    });

    doc.text(`${t('invoice.totalAmount')}: ${preis} €`, 14, doc.lastAutoTable.finalY + 15);

    doc.save(`${t('invoice.title')}_${rechnung.id || reservierungsId}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!rechnung) {
    return (
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {t('invoice.errorLoading')}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(120deg, #e3f2fd 0%, #f5faff 100%)',
          borderRadius: 4,
          boxShadow: 3,
          p: { xs: 2, sm: 4 },
          mb: 4,
          textAlign: 'center'
        }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
          }}>
            <ReceiptIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            color: 'primary.main', 
            mb: 1, 
            letterSpacing: 1 
          }}>
            {t('invoice.title')}
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: 'text.secondary'
          }}>
            #{rechnung.id || reservierungsId}
          </Typography>
        </Box>

        {/* Invoice Content */}
        <Paper sx={{
          borderRadius: 4,
          boxShadow: 6,
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
        }}>
          <Box sx={{ p: 4 }}>
            {/* Company Info & Invoice ID Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Carvia GmbH Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: 3,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  color: 'white',
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        background: 'rgba(255,255,255,0.2)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}>
                        <ReceiptIcon sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 800,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                      }}>
                        Carvia GmbH
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      background: 'rgba(255,255,255,0.1)',
                      p: 2,
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                        Musterstraße 1<br />
                        12345 Musterstadt<br />
                        Deutschland
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Invoice ID Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: 3,
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                  color: 'white',
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        background: 'rgba(255,255,255,0.2)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}>
                        <ReceiptIcon sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 800,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                      }}>
                        {t('invoice.details')}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      background: 'rgba(255,255,255,0.1)',
                      p: 2,
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ 
                          opacity: 0.9,
                          fontSize: '0.9rem',
                          minWidth: 'fit-content'
                        }}>
                          {t('invoice.invoiceNumber')}:
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}>
                          {rechnung.id || reservierungsId}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ 
                          opacity: 0.9,
                          fontSize: '0.9rem',
                          minWidth: 'fit-content'
                        }}>
                          {t('invoice.issueDate')}:
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}>
                          {rechnung.Austellungsdatum || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {/* Customer & Bank Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: 3,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {t('invoice.customer')}
                      </Typography>
                    </Box>
                    <Box sx={{
                      background: 'rgba(255,255,255,0.8)',
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid rgba(25, 118, 210, 0.1)'
                    }}>
                      <Typography variant="body1" sx={{ 
                        whiteSpace: 'pre-line',
                        lineHeight: 1.8,
                        color: 'text.primary'
                      }}>
                        {kunde ? [
                          kunde.Vorname + " " + kunde.Nachname,
                          kunde.Strasse + " " + kunde.HausNummer,
                          kunde.PLZ + " " + kunde.Ort
                        ].filter(Boolean).join('\n') : t('invoice.customerDataNotAvailable')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: 3,
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}>
                        <AccountBalanceIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#7b1fa2' }}>
                        {t('invoice.bankInformation')}
                      </Typography>
                    </Box>
                    <Box sx={{
                      background: 'rgba(255,255,255,0.8)',
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid rgba(123, 31, 162, 0.1)'
                    }}>
                      <Typography variant="body1" sx={{ 
                        whiteSpace: 'pre-line',
                        lineHeight: 1.8,
                        color: 'text.primary'
                      }}>
                        {kunde ? [
                          kunde.IBAN,
                          kunde.BIC
                        ].filter(Boolean).join('\n') : t('invoice.customerDataNotAvailable')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Invoice Table */}
            <Box sx={{ mb: 4 }}>
              <TableContainer component={Paper} sx={{ 
                borderRadius: 3, 
                boxShadow: 4, 
                background: 'linear-gradient(135deg, #f5faff 0%, #e3f2fd 100%)',
                border: '1px solid rgba(25, 118, 210, 0.1)'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                      '& .MuiTableCell-head': {
                        fontWeight: 800,
                        fontSize: '1rem',
                        letterSpacing: 0.5
                      }
                    }}>
                      <TableCell sx={{ color: 'white' }}>
                        {t('invoice.service')}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {t('invoice.vehicle')}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {t('invoice.paid')}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {t('invoice.issueDate')}
                      </TableCell>
                      <TableCell sx={{ color: 'white', textAlign: 'right' }}>
                        {t('invoice.price')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}>
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            mr: 2,
                            width: 36,
                            height: 36
                          }}>
                            <DirectionsCarIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography sx={{ fontWeight: 600 }}>
                            {t('invoice.vehicleRental')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3, fontWeight: 500 }}>
                        {fahrzeugInfo}
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip 
                          label={rechnung.Bezahlt ? t('common.yes') : t('common.no')}
                          color={rechnung.Bezahlt ? 'success' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3, fontWeight: 500 }}>
                        {rechnung.Austellungsdatum || '-'}
                      </TableCell>
                      <TableCell sx={{ 
                        py: 3, 
                        textAlign: 'right', 
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: 'primary.main'
                      }}>
                        {preis} €
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Total Amount & Download Section */}
            <Grid container spacing={3} alignItems="stretch">
              {/* Total Amount */}
              <Grid item xs={12} md={8}>
                <Card sx={{ 
                  textAlign: 'right', 
                  p: 3,
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                  borderRadius: 3,
                  border: '2px solid rgba(245, 124, 0, 0.3)',
                  boxShadow: 3,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800, 
                      color: '#f57c00',
                      mb: 1
                    }}>
                      {t('invoice.totalAmount')}
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 900, 
                      color: '#e65100',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {preis} €
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Download Button */}
              <Grid item xs={12} md={4}>
                <Card sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                  borderRadius: 3,
                  border: '2px solid rgba(76, 175, 80, 0.3)',
                  boxShadow: 3,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Button
                    onClick={downloadPDF}
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    fullWidth
                    sx={{
                      py: 2,
                      px: 3,
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                      boxShadow: 4,
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {t('invoice.downloadPdf')}
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}