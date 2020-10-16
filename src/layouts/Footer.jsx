import React from 'react';

function Footer() {
  return (
    <div>
      <footer className="footer footer-static footer-light navbar-shadow">
        <p className="clearfix blue-grey lighten-2 mb-0">
          <span className="float-md-left d-block d-md-inline-block mt-25">
            COPYRIGHT &copy; 2020
            <a
              className="text-bold-800 grey darken-2"
              href="https://www.musicmilesrewards.com/"
              target="_blank"
            >
              MusicMilesRewards,
            </a>
            All rights Reserved
          </span>
          <span className="float-md-right d-none d-md-block">
          Technology Partner, Hand-crafted & Made By <a target="_blank" href="https://sixberries.com/">SixBerries</a>
          </span>
          <button className="btn btn-primary btn-icon scroll-top" type="button">
            <i className="feather icon-arrow-up"></i>
          </button>
        </p>
      </footer>
    </div>
  );
}

export default Footer;
