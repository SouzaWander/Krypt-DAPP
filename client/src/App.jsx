import { Navbar, Welcome, Footer, Services, Transactions } from './components';


const App = () => {

  return (
    <div className="min-h-screen">
      <div class="gradient-bg-welcome">
        <Navbar />
        <Welcome></Welcome>
      </div>
      <Services></Services>
      <Transactions></Transactions>
      <Footer></Footer>
    </div>
  );
}

export default App;
