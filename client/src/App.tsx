import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Home } from "./pages/Home";
import { Store } from "./pages/Store";
import { About } from "./pages/About";
import { Navbar } from "./components/Navbar";
import {
  ShoppingCartProvider
} from "./context/ShoppingCartContext";
import { Success } from "./pages/Success";

function App() {
  return (
    <ShoppingCartProvider>
      <Navbar />
      <Container className="mb-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/success"
            element={<Success />}
          />
          <Route path="*" element={<h1>Page not found!</h1>} />
        </Routes>
      </Container>
    </ShoppingCartProvider>
  );
}

export default App;
