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
        '& .MuiAvatar-root': {
            width: 54,
            height: 54,
        }
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
    mobileFix: {
        display: 'block',
        padding: '20px 0',
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            padding: 0,
        },
    },
    summaryContainer: {
        padding: '10px 0',
        '& .MuiTypography-h1': {
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '30px',
            color: '#ffffff',
            [theme.breakpoints.up('md')]: {
                fontSize: '24px',
            },
        },
        '& .MuiTypography-body2': {
            fontSize: '12px',
            fontWeight: 400,
            color: '#8585A6',
            letterSpacing: '0.2px',
            [theme.breakpoints.up('md')]: {
                fontSize: '15px',
            },
        },
        '& .MuiDivider-root': {
            width: '1px',
            height: '21px',
            borderColor: '#3F4465',
            margin: '0 15px',
            [theme.breakpoints.up('lg')]: {
                margin: '0 30px',
            },
        },
    },
    network: {
        textTransform: 'uppercase',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.5px',
    },
    paper: {
        backgroundColor: '#272B4A',
        marginTop: '20px',
        padding: '20px',
        borderRadius: '20px',
    },
    dw: {
        backgroundColor: '#272B4A',
        borderRadius: '20px',
    },
    customOrder: {
        order: 0,
        [theme.breakpoints.up('md')]: {
            order: 1,
            width: '100%',
            position: 'absolute',
            right: 0,
            paddingLeft: '24px',
        },
    },
    tabs: {
        backgroundColor: '#14182B',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        '& .MuiButton-root': {
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.1px',
            textTransform: 'capitalize',
            color: '#6B7199',
            background: 'none',
            width: '50%',
            padding: 0,
            margin: 0,
            height: '60px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            '&:hover': {
                background: 'none',
            },
        }
    },
    selected: {
        color: '#ffffff !important',
        borderBottom: 'solid 3px #3F466D'
    },
    balanceText: {
        fontSize: '14px',
        fontWeight: 400,
        color: '#8585A6',
        letterSpacing: '0.2px',
        lineHeight: '14px',
    },
    balanceContainer: {
        '& img': {
            height: 16,
            width: 16,
        },
        '& .MuiTypography-body1': {
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            color: '#ffffff',
        },
        '& .MuiButton-root': {
            fontSize: '16px',
            fontWeight: 600,
            color: '#6B7199',
            backgroundColor: '#232743',
            borderRadius: '20px',
            textTransform: 'capitalize',
            letterSpacing: '0.1px',
            padding: '3px 15px',
            transition: 'color 0.2s',
            '&:hover': {
                color: '#ffffff',
                backgroundColor: '#3F466D',
                transition: 'color 0.1s'
            }
        }
    },
    inputContainer: {
        paddingTop: '10px',
        '& .MuiPaper-root': {
            position: 'relative',
            backgroundColor: '#14182B',
            border: 'solid 2px #3F466D',
            borderRadius: '30px',
            padding: 0,
            margin: 0,
            '& .MuiInputBase-input': {
                padding: '10px 5px 8px 40px',
                fontSize: '21px',
                fontWeight: 600,
            }
        },
        '& .MuiTextField-root': {
            backgroundColor: '#14182B',
            border: 'solid 2px #3F466D',
            borderRadius: '30px',
            padding: '3px 10px',
        },
        '& .MuiButton-root': {
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: '#ffffff',
            backgroundColor: '#313759',
            borderRadius: '30px',
            margin: 0,
            padding: '5px 12px',
            position: 'absolute',
            top: '6px',
            right: '5px',
            minWidth: 0,
        }
    },
    inputLogo: {
        position: 'absolute',
        top: '12px',
        left: '12px',
        '& img': {
            height: 20,
            width: 20,
        }
    },
    feeContainer: {
        backgroundColor: '#313759',
        borderRadius: '10px',
        '& .MuiIconButton-root': {
            margin: 0,
            padding: 0,
            width: 14,
            height: 14,
        },
        '& .MuiTypography-h1': {
            fontSize: '14px',
            lineHeight: '18px',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#8585A6',
        },
        '& .MuiTypography-h2': {
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.2px',
            color: '#ffffff',
            paddingTop: '5px',
        },
        '& .MuiTypography-body1': {
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#8585A6',
            paddingTop: '5px',
            letterSpacing: '0.2px',
        },
        '& .MuiDivider-root': {
            margin: '20px 0',
            color: '#8585A6',
        }
    },
    btnDeposit: {
        fontSize: '21px',
        fontWeight: 700,
        letterSpacing: '0.2px',
        textTransform: 'capitalize',
        color: '#ffffff',
        backgroundColor: '#54995C',
        borderRadius: '40px',
        '&:hover': {
            backgroundColor: '#389D44'
        }
    },
    btnPurchaseDeposit: {
        fontSize: '21px',
        fontWeight: 700,
        letterSpacing: '0.2px',
        textTransform: 'capitalize',
        color: '#ffffff',
        borderRadius: '40px',
        border: 'solid 2px #54995C',
        '&:disabled': {
            backgroundColor: '#434864',
            border: 'solid 2px #434864',
        }
    },
    boostContainer: {
        backgroundColor: '#313759',
        borderRadius: '16px',
        '& .MuiTypography-h1': {
            fontSize: '24px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#E88225'
        },
        '& .MuiTypography-h2': {
            fontSize: '24px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#ffffff'
        },
        '& .MuiTypography-body1': {
            fontSize: '14px',
            lineHeight: '18px',
            color: '#8585A6',
            letterSpacing: '0.2px',
        },
        '& img': {
            width: 30,
            height: 30,
        },
        '& .MuiIconButton-root': {
            margin: '0 0 0 5px',
            padding: 0,
        }
    }
});

export default styles;