const styles = {
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
};

export default styles;
