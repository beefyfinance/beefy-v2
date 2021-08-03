const styles = (theme) => ({
    vaultContainer: {
        marginTop: '40px',
    },
    title: {
        marginTop: '40px',
        '& .MuiTypography-h1': {
            fontSize: '48px',
            lineHeight: '54px',
            fontWeight: 600,
            paddingLeft: '10px',
        },
        '& .MuiTypography-h2': {
            fontSize: '48px',
            lineHeight: '54px',
            fontWeight: 600,
            color: '#E88225',
        },
        '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
            width: 54,
            height: 54,
        },
    },
    btnGoBack: {
        fontSize: '14px',
        lineHeight: '18px',
        fontWeight: 600,
        color: '#6B7199',
        backgroundColor: '#14182B',
        letterSpacing: '0.2px',
        textTransform: 'inherit',
        borderRadius: '20px',
        padding: '6px 20px 6px 10px',
    },
    summary: {
        '& .MuiTypography-h1': {
            fontSize: '42px',
            lineHeight: '54px',
            fontWeight: 600,
            letterSpacing: '0.5px',
        },
        '& .MuiTypography-body1': {
            fontSize: '18px',
            lineHeight: '24px',
            color: '#8585A6',
            letterSpacing: '0.2px',
        }
    },
    partner: {
        padding: '32px',
        borderRadius: '20px',
    },
    social: {
        textAlign: 'right',
        '& .MuiLink-root': {
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '24px',
            letterSpacing: '0.1px',
            marginLeft: '10px',
        }
    },
    partnerBody: {
        marginTop: '20px',
        fontWeight: 400,
        fontSize: '18px',
        lineHeight: '32px',
    },
    splitPaper: {
        borderRadius: '20px',
        '& .MuiTypography-root': {
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: '30px',
            textAlign: 'center',
            '& span': {
                fontSize: '16px',
            }
        },
        '& .MuiTypography-h2': {
            fontSize: '15px',
            fontWeight: 400,
            color: '#8585A6',
            marginBottom: '30px',
        }
    },
    splitA: {
        backgroundColor: '#272B4A',
        width: '50%',
        borderTopLeftRadius: '20px',
        borderBottomLeftRadius: '20px',
        padding: '32px',
    },
    splitB: {
        backgroundColor: '#313759',
        width: '50%',
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
        padding: '32px',
    },
    btnSubmit: {
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '0.2px',
        textTransform: 'none',
        color: '#ffffff',
        backgroundColor: '#54995C',
        borderRadius: '30px',
        padding: '6px 33px',
        '&:hover': {
            backgroundColor: '#389D44'
        }
    },
    btnClaim: {
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '0.2px',
        textTransform: 'none',
        color: '#ffffff',
        backgroundColor: 'none',
        borderRadius: '30px',
        borderColor: '#54995C',
        borderWidth: '2px',
        borderStyle: 'solid',
        padding: '6px 33px',
        '&:hover': {
            backgroundColor: 'rgba(20, 24, 43, 0.5)',
            borderColor: '#389D44'
        }
    }
});

export default styles;
