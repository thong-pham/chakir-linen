import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../lib/settings'
import * as helper from '../lib/helper'

const AccountBreadcrumbs = ({ path, name }) => {
  //const items = helper.getCategoryBreadcrumbs(currentCategory.id, categories);
  return (
    <nav className="breadcrumb is-small" aria-label="breadcrumbs" style={{marginLeft: '17%'}}>
      <ul>
        <li>
          <NavLink to="/">{text.home}</NavLink>
        </li>
        <li>
          <NavLink to="/account-2">{text.account}</NavLink>
        </li>
        <li className="is-active">
          <a href={path} aria-current="page">{name}</a>
        </li>
      </ul>
    </nav>
  )
}

export default AccountBreadcrumbs;
