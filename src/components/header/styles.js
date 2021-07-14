const styles = (theme) => ({
    navHeader: {
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        paddingTop: '20px',
        '& .MuiListItem-button': {
            color: theme.palette.type === 'dark' ? '#6B7199' : '#000000',
            '& .MuiTypography-root': {
                fontWeight: 'bold',
                textTransform: 'capitalize',
                borderBottom: '2px solid transparent',
                '&:hover': {
                    color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
                    borderColor: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
                }
            }
        },
        '&:hover .MuiListItem-button': {
            background: 'transparent',
        },
    },
    hasPortfolio: {
      backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
    },
    navDisplayFlex: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 0,
        paddingBottom: 0,
    },
    list: {
        width: 250,
    },
    beefy: {
        display: 'flex',
        paddingTop: '4px',
        letterSpacing: 'unset',
        alignItems: 'center',
        justifyContent: 'center',
        '&,& .MuiButton-root': {
            fontSize: '20px',
            fontWeight: '700',
            borderRadius: '3px',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            color: theme.palette.text.primary,
            textDecoration: 'none',
            '&:hover,&:focus': {
                color: theme.palette.text.primary,
                background: 'transparent',
            },
        },
        '& a': {
            marginLeft: '10px',
        },
        '& img': {
            height: '24px',
        }
    },
    mobileLink: {
        color: "#6B7199",
        textDecoration: "none",
        textTransform: "capitalize"
    }
})

export default styles;