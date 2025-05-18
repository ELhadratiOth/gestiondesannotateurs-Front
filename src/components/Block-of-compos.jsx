import Navbar from './Navbar';
import Footer from './Footer';
import { AppSidebar } from './side-bar';
import { useLocation } from 'react-router-dom';


const BlockOfCompos = ({ children }) => {
  const location = useLocation();
  const { user } = location.state || {};
  console.log('user block : ', user);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userInfo={user} />
      <div className="flex flex-1">
        <AppSidebar userInfo={user} />
        <main className="flex-1 p-16 ">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default BlockOfCompos;
