const styles = (theme) => ({
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
            textTransform: 'inherit',
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
        },
        '& .MuiInputBase-root': {
            width: '100%',
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
    btnSubmit: {
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
