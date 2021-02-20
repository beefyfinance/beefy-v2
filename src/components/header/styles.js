const styles = (theme) => ({
    navHeader: {
        backgroundColor: theme.palette.type === 'dark' ? '#505067' : '#faf6f1',
        '& .MuiListItem-button': {
            color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
        }
    },
    navDisplayFlex: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    linkText: {
        textDecoration: 'none',
        textTransform: 'capitalize',
        color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
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
            fontSize: '24px',
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
    },
    netControl: {
        minWidth: 160,
        '& .MuiFormLabel-root': {
            minWidth: '100px',
        },
        '& .MuiSelect-select': {
            fontSize: '12px',
            fontWeight: 'bold',
        },
        '& .MuiOutlinedInput-input': {
            padding: '12px',
        },
    },
    walletControl: {
        width: '140px',
        marginLeft: '5px',
        '& .MuiOutlinedInput-input': {
            padding: '14px',
            paddingLeft: '40px',
        },
        '& .MuiInputBase-input': {
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'default',
        }
    },
    walletStatus: {
        color: theme.palette.success.main,
        backgroundColor: 'transparent',
    }
})

export default styles;