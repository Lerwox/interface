import React from 'react'
import styled from 'styled-components'

import Section from '@/components/Section'

import Logo from '@/public/assets/logo.svg'

const StyledLegalLayout = styled(Section)`
  h1#title {
    font-size: 20px;
    text-align: center;
    margin-bottom: 64px;
  }

  padding: 16px;

  @media (max-width: 600px) {
    body {
      font-size: 0.9em;
      padding: 1em;
    }
  }

  a {
    color: ${({ theme }) => theme.text2} !important;
  }

  strong > u {
    margin: 2rem 0;
    font-size: 20px;
    display: block;
  }

  @media print {
    body {
      background-color: transparent;
      color: black;
      font-size: 12pt;
    }

    p,
    h2,
    h3 {
      orphans: 3;
      widows: 3;
    }

    h2,
    h3,
    h4 {
      page-break-after: avoid;
    }
  }

  p {
    margin: 1em 0;
  }

  a {
    color: #1a1a1a;
  }

  a:visited {
    color: #1a1a1a;
  }

  img {
    max-width: 100%;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.4em;
  }

  h5,
  h6 {
    font-size: 1em;
    font-style: italic;
  }

  h6 {
    font-weight: normal;
  }

  ol,
  ul {
    padding-left: 1rem;
    margin: 1em 0 1.5em;
  }

  li > ol,
  li > ul {
    margin-top: 0;
  }

  blockquote {
    margin: 1em 0 1em 1.7em;
    padding-left: 1em;
    border-left: 2px solid #e6e6e6;
    color: #606060;
  }

  code {
    font-family: Inconsolata, monospace;
    font-size: 85%;
    margin: 0;
  }

  pre {
    margin: 1em 0;
    overflow: auto;
  }

  pre code {
    padding: 0;
    overflow: visible;
  }

  .sourceCode {
    background-color: transparent;
    overflow: visible;
  }

  hr {
    background-color: #1a1a1a;
    border: none;
    height: 1px;
    margin: 1em 0;
  }

  table {
    margin: 1em 0;
    border-collapse: collapse;
    width: 100%;
    overflow-x: auto;
    display: block;
    font-variant-numeric: lining-nums tabular-nums;
  }

  table caption {
    margin-bottom: 0.75em;
  }

  tbody {
    margin-top: 0.5em;
    border-top: 1px solid #1a1a1a;
    border-bottom: 1px solid #1a1a1a;
  }

  th {
    border-top: 1px solid #1a1a1a;
    padding: 0.25em 0.5em 0.25em 0.5em;
  }

  td {
    border: 1px solid white;
    padding: 0.125em 0.5em 0.25em 0.5em;
  }

  header {
    margin-bottom: 4em;
    text-align: center;
  }

  #TOC li {
    list-style: none;
  }

  #TOC a:not(:hover) {
    text-decoration: none;
  }

  code {
    white-space: pre-wrap;
  }

  span.smallcaps {
    font-variant: small-caps;
  }

  span.underline {
    text-decoration: underline;
  }

  div.column {
    display: inline-block;
    vertical-align: top;
    width: 50%;
  }

  div.hanging-indent {
    margin-left: 1.5em;
    text-indent: -1.5em;
  }

  ul.task-list {
    list-style: none;
  }

  .display.math {
    display: block;
    text-align: center;
    margin: 0.5rem auto;
  }
`

const StyledLogo = styled(Logo)`
  width: 350px;
  display: block;
  margin: 64px auto 32px;
  fill: ${({ theme }) => theme.white};
`

export default function LegalLayout({ children }: { children: React.ReactElement }) {
  return (
    <StyledLegalLayout>
      <StyledLogo />
      {children}
    </StyledLegalLayout>
  )
}
