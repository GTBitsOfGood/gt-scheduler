import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import swal from '@sweetalert/with-react';
import { classes } from '../../utils';
import { Header, Scheduler, Map, NavDrawer, NavMenu, Attribution } from '..';
import { Oscar } from '../../beans';
import { useCookie, useJsonCookie, useMobile } from '../../hooks';
import { TermContext, TermsContext, ThemeContext } from '../../contexts';
import { defaultTermData } from '../../types';

import 'react-virtualized/styles.css';
import './stylesheet.scss';

const NAV_TABS = ['Scheduler', 'Map'];

const App = () => {
  const [terms, setTerms] = useState([]);
  const [oscar, setOscar] = useState(null);

  // Persist the theme, term, and some term data as cookies
  const [theme, setTheme] = useCookie('theme', 'dark');
  const [term, setTerm] = useCookie('term');
  const [termData, patchTermData] = useJsonCookie(term, defaultTermData);

  // Memoize context values so that their references are stable
  const themeContextValue = useMemo(() => [theme, setTheme], [theme, setTheme]);
  const termsContextValue = useMemo(() => [terms, setTerms], [terms, setTerms]);
  const termContextValue = useMemo(
    () => [
      { term, oscar, ...termData },
      { setTerm, setOscar, patchTermData }
    ],
    [term, oscar, termData, setTerm, setOscar, patchTermData]
  );

  // display popup when first visiting the site
  useEffect(() => {
    // From https://stackoverflow.com/a/22859920/13192375
    const weeksBetween = (d1, d2) =>
      Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000));
    const migrationDate = new Date(2021, 2, 17); // 03-17-2021
    const now = new Date();
    const weeksUntil = weeksBetween(now, migrationDate);
    const weeksUntilStr = weeksUntil < 1 ? '<1' : String(weeksUntil);
    swal({
      button: 'Got It!',
      content: (
        <div>
          <h2>Attention all GT Scheduler Users</h2>
          <p>
            The Bits of Good GT Scheduler team is excited to announce that we
            will be merging our changes with the original upstream and
            spectacular GT Scheduler project created by{' '}
            <strong>Jinseo (Jason) Park</strong>. We will be working together
            under a new{' '}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://github.com/gt-scheduler"
            >
              GT Scheduler organization
            </a>{' '}
            to make class registration easier for everybody!
          </p>
          <p>
            We will be officially migrating to our new internet home,{' '}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://gt-scheduler.org"
            >
              gt-scheduler.org
            </a>
            , on{' '}
            <strong>
              Wednesday, March 17th, 2021 or {weeksUntilStr} weeks out from
              today!
            </strong>
          </p>
          <h3>What does this mean for you?</h3>
          <p>
            It means all your favorite GT Scheduler features will be
            consolidated on{' '}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://gt-scheduler.org"
            >
              gt-scheduler.org
            </a>
            , but{' '}
            <strong>no personal data will be migrated over or saved</strong>.
            You can save your existing data by downloading your classes as a
            png, exporting the classes to your calendar, or copying the CRNs.
          </p>
          <h3>Can I still use the old websites?</h3>
          <p>
            The current GT Scheduler projects (
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://gtbitsofgood.github.io/gt-scheduler"
            >
              Bits of Good&apos;s fork
            </a>{' '}
            and{' '}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://jasonpark.me/gt-scheduler/"
            >
              Jason Park&apos;s original
            </a>
            ) will no longer be active or available after March 17th.
          </p>
        </div>
      )
    });
  }, []);

  // Fetch the current term's scraper information
  useEffect(() => {
    setOscar(null);
    if (term) {
      axios
        .get(`https://gtbitsofgood.github.io/gt-schedule-crawler/${term}.json`)
        .then((res) => {
          const newOscar = new Oscar(res.data);
          setOscar(newOscar);
        });
    }
  }, [term]);

  // Fetch all terms via the GitHub API
  useEffect(() => {
    axios
      .get(
        'https://api.github.com/repos/GTBitsOfGood/gt-schedule-crawler/contents?ref=gh-pages'
      )
      .then((res) => {
        const newTerms = res.data
          .map((content) => content.name)
          .filter((name) => /\d{6}\.json/.test(name))
          .map((name) => name.replace(/\.json$/, ''))
          .sort()
          .reverse();
        setTerms(newTerms);
      });
  }, [setTerms]);

  // Set the term to be the first one if it is unset
  // (once the terms load)
  useEffect(() => {
    if (!term) {
      const [recentTerm] = terms;
      setTerm(recentTerm);
    }
  }, [terms, term, setTerm]);

  // Re-render when the page is re-sized to become mobile/desktop
  // (desktop is >= 1024 px wide)
  const mobile = useMobile();
  const className = classes('App', mobile && 'mobile', theme);

  // Allow top-level tab-based navigation
  const [currentTabIndex, setTabIndex] = useState(0);

  // Handle the status of the drawer being open on mobile
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  useEffect(() => {
    // Close the drawer if switching to desktop
    if (isDrawerOpen && !mobile) {
      setIsDrawerOpen(false);
    }
  }, [isDrawerOpen, mobile]);

  // If the scraped JSON hasn't been loaded,
  // then show an empty div as a loading intermediate
  if (!oscar) {
    return <div className={className} />;
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <TermsContext.Provider value={termsContextValue}>
        <TermContext.Provider value={termContextValue}>
          <div className={classes('App', className)}>
            {/* On mobile, show the nav drawer + overlay */}
            {mobile && (
              <NavDrawer open={isDrawerOpen} onClose={closeDrawer}>
                <NavMenu
                  items={NAV_TABS}
                  currentItem={currentTabIndex}
                  onChangeItem={setTabIndex}
                />
              </NavDrawer>
            )}
            {/* The header controls top-level navigation
            and is always present */}
            <Header
              currentTab={currentTabIndex}
              onChangeTab={setTabIndex}
              onToggleMenu={openDrawer}
              tabs={NAV_TABS}
            />
            {currentTabIndex === 0 && <Scheduler />}
            {currentTabIndex === 1 && <Map />}
            <Attribution />
          </div>
        </TermContext.Provider>
      </TermsContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
