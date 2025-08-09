import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardHeader, Button, Box } from '@mui/material';
import { AddCircleOutline, Preview, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <AddCircleOutline color="primary" sx={{ fontSize: 40 }} />,
    title: 'Create Dynamic Forms',
    description: 'Easily build customizable forms with multiple field types and validations.',
    route: '/create',
  },
  {
    icon: <Preview color="primary" sx={{ fontSize: 40 }} />,
    title: 'Preview Forms',
    description: 'Interact with your forms as an end user to test validations and behaviors.',
    route: '/preview',
  },
  {
    icon: <Description color="primary" sx={{ fontSize: 40 }} />,
    title: 'Manage Saved Forms',
    description: 'View and manage all your saved forms stored in local storage.',
    route: '/myforms',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Dynamic Form Builder
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Build, preview, and manage dynamic forms with ease using React, TypeScript, and Material-UI.
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map(({ icon, title, description, route }) => (
          <Grid size={{xs:12 , md:4}} key={title}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate(route)} elevation={3}>
              <CardHeader
                avatar={icon}
                title={title}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" gap={2}>
        <Button variant="contained" color="primary" onClick={() => navigate('/create')}>
          Create New Form
        </Button>
        <Button variant="outlined" color="primary" onClick={() => navigate('/myforms')}>
          View My Forms
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
