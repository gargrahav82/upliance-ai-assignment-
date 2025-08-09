import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateForm from './pages/CreateForm';
import Home from './pages/Home';
import PreviewForm from './pages/PreviewForm';
import MyForms from './pages/MyForms';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path="/create" element={<CreateForm />} />
      <Route path="/preview/:formId" element={<PreviewForm/>} />
      <Route path="/myforms" element={<MyForms />} />
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default App;
