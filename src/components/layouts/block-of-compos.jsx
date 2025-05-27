import Navbar from './Navbar';
import Footer from './Footer';
import { AppSidebar } from './side-bar';
import { useAuth } from '../../context/AuthContext';

const BlockOfCompos = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col ">
      <Navbar />
      <div className="flex flex-1 ">
        <AppSidebar userInfo={user} />
        <main className="flex-1 p-16 ml-64 ">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default BlockOfCompos;
