import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ title, links = [] }) {
  return (
    <div className="ul-breadcrumb">
      <h1 className="ul-breadcrumb-title">{title}</h1>
      <div className="ul-breadcrumb-nav">
        <Link to="/">Home</Link>
        {links.map((link, i) => (
          <React.Fragment key={i}>
            <i className="bi bi-chevron-right"></i>
            {link.to ? <Link to={link.to}>{link.label}</Link> : <span>{link.label}</span>}
          </React.Fragment>
        ))}
        {links.length === 0 && (
          <>
            <i className="bi bi-chevron-right"></i>
            <span>{title}</span>
          </>
        )}
      </div>
    </div>
  );
}
