import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function PageNav({ page }) {
  const navigate = useNavigate();
  function handleClick() {
    navigate(`/${page}`);
  }
  return (
    <nav className="page-nav">
      <div className="container">
        <p>
          <Link to="/" className="home-link">
            Home
          </Link>{' '}
          &gt; <span onClick={handleClick}>{page}</span>
        </p>
      </div>
    </nav>
  );
}
export default PageNav;
