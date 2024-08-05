import React, { type ChangeEventHandler, memo, type ReactNode, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  selectTenderlyCredentialsOrUndefined,
  selectTenderlyStatus,
} from '../../../features/data/selectors/tenderly';
import { type TenderlyCredentials, tenderlyLogin } from '../../../features/data/actions/tenderly';
import { InputBase, makeStyles } from '@material-ui/core';
import { Button } from '../../Button';
import { VerticalLayout } from '../Layout/VerticalLayout';
import { ErrorMessage } from '../Error/ErrorMessage';
import { styles } from './styles';
import { ExternalLink } from '../Links/ExternalLink';
import { HorizontalLayout } from '../Layout/HorizontalLayout';
import { InfoOutlined } from '@material-ui/icons';
import { AlertInfo } from '../../Alerts';
import logoUrl from '../logo.svg';

const useStyles = makeStyles(styles);

type CredentialInputProps = {
  type: 'text' | 'password';
  field: keyof TenderlyCredentials;
  credentials: TenderlyCredentials;
  setCredentials: (value: (prevState: TenderlyCredentials) => TenderlyCredentials) => void;
  label: string;
  placeholder: string;
  help?: ReactNode;
  helpLink?: string | { url: string; text: string; icon?: string };
};

const CredentialInput = memo<CredentialInputProps>(function CredentialInput({
  type,
  field,
  credentials,
  setCredentials,
  label,
  placeholder,
  help,
  helpLink,
}) {
  const classes = useStyles();
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => setCredentials(creds => ({ ...creds, [field]: e.target.value })),
    [setCredentials, field]
  );
  const hasHelp = !!help || !!helpLink;

  return (
    <VerticalLayout className={classes.field} gap={8}>
      <div className={classes.label}>{label}</div>
      <div className={hasHelp ? classes.inputHelpHolder : classes.inputHolder}>
        <InputBase
          type={type}
          className={classes.input}
          value={credentials[field]}
          onChange={handleChange}
          placeholder={placeholder}
        />
        {hasHelp ? (
          <HorizontalLayout className={classes.help} gap={8}>
            <InfoOutlined className={classes.helpIcon} />
            {help ? <div className={classes.helpText}>{help}</div> : null}
            {helpLink ? (
              <div className={classes.helpLink}>
                <ExternalLink
                  className={classes.helpLinkAnchor}
                  href={typeof helpLink === 'string' ? helpLink : helpLink.url}
                  icon={true}
                >
                  {typeof helpLink === 'string' || !helpLink.icon ? null : (
                    <img
                      src={helpLink.icon}
                      width={20}
                      height={20}
                      alt=""
                      className={classes.helpLinkIcon}
                    />
                  )}
                  {typeof helpLink === 'string' ? 'Help' : helpLink.text}
                </ExternalLink>
              </div>
            ) : null}
          </HorizontalLayout>
        ) : null}
      </div>
    </VerticalLayout>
  );
});

const accountHelpLink = {
  url: 'https://dashboard.tenderly.co/account/settings',
  text: 'Profile',
  icon: logoUrl,
};

const projectHelpLink = {
  url: 'https://dashboard.tenderly.co/account/projects',
  text: 'Projects',
  icon: logoUrl,
};

const tokenHelpLink = {
  url: 'https://dashboard.tenderly.co/account/authorization',
  text: 'Access Tokens',
  icon: logoUrl,
};

export const LoginForm = memo(function LoginForm() {
  const status = useAppSelector(selectTenderlyStatus);
  const dispatch = useAppDispatch();
  const existingCredentials = useAppSelector(selectTenderlyCredentialsOrUndefined);
  const [credentials, setCredentials] = useState(
    () => existingCredentials || { account: '', project: '', secret: '' }
  );
  const handleSave = useCallback(() => {
    dispatch(tenderlyLogin({ credentials }));
  }, [dispatch, credentials]);

  return (
    <VerticalLayout>
      <AlertInfo>
        {`Enter your Tenderly Credentials to continue. These are saved in your browser local storage for ${window.location.host}.`}
      </AlertInfo>
      {status === 'rejected' ? <ErrorMessage /> : null}
      <CredentialInput
        setCredentials={setCredentials}
        credentials={credentials}
        field={'account'}
        type={'text'}
        label={'Account Slug'}
        placeholder={'e.g. username'}
        help={
          <>
            https://dashboard.tenderly.co/<strong>username</strong>/project/
          </>
        }
        helpLink={accountHelpLink}
      />
      <CredentialInput
        setCredentials={setCredentials}
        credentials={credentials}
        field={'project'}
        type={'text'}
        label={'Project Slug'}
        placeholder={'e.g. project'}
        help={
          <>
            https://dashboard.tenderly.co/username/<strong>project</strong>/
          </>
        }
        helpLink={projectHelpLink}
      />
      <CredentialInput
        setCredentials={setCredentials}
        credentials={credentials}
        field={'secret'}
        type={'password'}
        label={'Access Token'}
        placeholder={'e.g. AA11bb22CC33dd44EE55ff66GG77hh88'}
        help={<>API Access Token</>}
        helpLink={tokenHelpLink}
      />
      <Button
        variant="success"
        onClick={handleSave}
        disabled={
          status === 'pending' ||
          !credentials.account ||
          !credentials.project ||
          !credentials.secret
        }
        fullWidth={true}
      >
        Save
      </Button>
    </VerticalLayout>
  );
});
